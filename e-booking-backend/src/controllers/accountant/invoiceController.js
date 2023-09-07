import {
	Invoiced,
	InvoiceDetail,
	User,
	InvoicePayment,
	Account,
	CashFlow,
} from "../../models";

import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generate from "../../utils/generateChonologicId";

const create = asyncWrapper(async (req, res) => {
	let deliveryLink;
	const data = req.body;

	if (!data.details || !data.clientName || !data.clientType || !data.function) {
		return res.status(400).json({
			status: "error",
			message: "details ,clientName, clientType , function is requried ",
		});
	}
	if (data.deliveryLink) {
		deliveryLink = data.deliveryLink;
	}
	let total = 0;

	for (let dataElement of data.details) {
		if (
			(!dataElement.quantity ||
				!dataElement.times ||
				(!dataElement.price && !dataElement.unitPrice),
			!dataElement.name)
		) {
			return res.status(400).json({
				status: "error",
				message: `Quantity, times, price and name are both required under details`,
			});
		}

		total =
			total +
			Number(
				dataElement.price *
					dataElement.quantity *
					(dataElement?.times ? dataElement?.times : 1)
			);
	}

	const invoice = await Invoiced.create({
		userId: req?.user?.id,
		clientName: data.clientName,
		clientType: data.clientType,
		function: data.function,
		deliveryLink,
		total: data.total,
		vatTotal: data.vatTotal,
		pax: data.pax,
		currency: data.currency,
		status: "PENDING",
		invoiceGenerated: `IV_${await generate(Invoiced)}`,
	});

	for (let element of data.details) {
		await InvoiceDetail.create({
			name: element.name,
			times: element.times,
			quantity: element.quantity,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
			price: element?.price || element?.unitPrice,
			VAT: element.VAT,
			invoiceId: invoice.id,
		});
	}

	const delivery = await Invoiced.findByPk(invoice.id, {
		include: {
			model: InvoiceDetail,
			attributes: { exclude: ["createdAt", "updatedAt"] },
		},
	});

	return res.status(200).json({
		status: "success",
		message: " Successfull Delivery note created sent",
		data: delivery,
	});
});

const index = asyncWrapper(async (req, res) => {
	const data = await Invoiced.findAll({
		include: [
			{
				model: InvoiceDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: InvoicePayment,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: User,
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"refreshToken",
						"password",
						"verifiedAT",
					],
				},
			},
		],
	});

	return res.status(200).json({ status: "success", data });
});

const payment = asyncWrapper(async (req, res) => {
	const { invoiceId, paymentIdentification, amount, paymentMethod } = req.body;
	if (!invoiceId) {
		return res.status(404).json({
			status: "error",
			message: "invoice ID is required!!!",
		});
	}
	let invoice = await Invoiced.findByPk(invoiceId, {
		include: [
			{
				model: InvoiceDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["updatedAt"] },
	});
	if (!invoice) {
		return res.status(404).json({
			status: "error",
			message: "Delivery note related to this Id not found",
		});
	}

	await InvoicePayment.create({
		paymentIdenfication: paymentIdentification,
		amount: amount,
		paymentMethod: paymentMethod,
		userId: req?.user?.id,
		invoiceId: invoiceId,
	});

	let accountInfo = await Account.findOne({ where: { name: "CASH" } });

	if (!accountInfo) {
		accountInfo = await Account.create({ name: "CASH", balance: 0 });
	}

	const cash_flow = await CashFlow.create({
		prevBalance: accountInfo.balance,
		newBalance: Number(accountInfo.balance) + Number(amount),
		date: new Date(),
		description: `Payment of ${amount} for invoice ${invoiceId} done by ${req.user.id} `,
		amount,
		account: "CASH",
		accountType: "DEBIT",
		doneBy: req.user.id,
		doneTo: "",
		status: "SUCCESS",
	});

	if (cash_flow) {
		accountInfo.set({ balance: cash_flow.newBalance });
	}
	await accountInfo.save();

	return res.status(200).json({
		status: "success",
		message: `Success Invoice payment completed `,
	});
});

const allPayments = asyncWrapper(async (req, res) => {
	const allPayments = await InvoicePayment.findAll({
		include: [{ model: Invoiced }],
	});

	return res.status(200).json({
		status: "Payments table fetched",
		data: allPayments,
	});
});

const paymentsByCompany = asyncWrapper(async (req, res) => {
	const { client } = req.query;

	if (!client) {
		return res.status(404).json({
			status: "Failed",
			message: "Please provide the client name",
		});
	}

	const invoices = await Invoiced.findAll({
		where: { clientName: client },
		include: [{ model: InvoicePayment }],
	});

	return res.status(200).json({
		status: "Success all invoices fetched",
		data: invoices,
	});
});

const update = asyncWrapper(async (req, res) => {
	const { id, clientDetails, details } = req.body;
	if (!id || !details || !clientDetails)
		return res.status(404).json({
			status: "error",
			message: "The ID, clientDetails and Details are all  required",
		});
	const invoice = await Invoiced.findByPk(id);
	if (!invoice) {
		return res.status(404).json({
			status: "error",
			message: "The invoice does not exist",
		});
	}

	await InvoiceDetail.destroy({
		where: { invoiceId: invoice.id },
		truncate: true,
	});

	for (let element of details) {
		await InvoiceDetail.create({
			name: element.name,
			times: element.times,
			quantity: element.quantity,
			price: element?.price || element?.unitPrice,
			VAT: element.VAT,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
			invoiceId: invoice.id,
		});
	}

	await Invoiced.update(
		{
			clientName: clientDetails.clientName,
			pax: clientDetails.pax,
			function: clientDetails.function,
			clientType: clientDetails.clientType,
			total: clientDetails.total,
			currency: clientDetails.currency,
			vatTotal: clientDetails.vatTotal,
		},
		{ where: { id: invoice.id } }
	);

	await invoice.save();

	const newInvoice = await Invoiced.findByPk(invoice.id, {
		include: [{ model: InvoiceDetail }],
	});

	return res
		.status(200)
		.json({ status: "OK", message: "updated !!!", data: newInvoice });
});
const approve = asyncWrapper(async (req, res) => {
	const { id } = req.body;
	if (!id)
		return res.status(404).json({
			status: "error",
			message: "The ID is required",
		});

	let invoice = await Invoiced.findByPk(id, {
		include: [
			{
				model: InvoiceDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["updatedAt"] },
	});

	if (!invoice)
		return res.status(404).json({
			status: "error",
			message: "Delivery note related to this Id not found",
		});

	await Invoiced.update({ status: "APPROVED" }, { where: { id } });

	return res
		.status(200)
		.json({ status: "OK", message: " approved", data: invoice });
});

const show = asyncWrapper(async (req, res) => {
	if (!req.params.id) {
		return res
			.status(400)
			.json({ status: "error", message: " Id is required" });
	}

	const data = await Invoiced.findByPk(req.params.id, {
		include: [
			{
				model: InvoiceDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
	});

	return res.status(200).json({ status: "Ok", data });
});

const destroy = asyncWrapper(async (req, res) => {
	if (!req.body.id) {
		return res.status(400).json({ status: "error", message: "Id is required" });
	}

	const invoice = await Invoiced.findByPk(req.body.id);

	if (!invoice) {
		return res
			.status(200)
			.json({ status: "success", message: " InvoiceDetail not found" });
	}

	await invoice.destroy({
		include: [
			{
				model: InvoiceDetail,
				as: "InvoiceDetails",
			},
		],
		truncate: true,
	});
	return res.status(200).json({
		status: "success",
		message: "InvoiceDetail successfully destroyed",
		data: { id: req.body.id },
	});
});

const deleteAll = asyncWrapper(async (req, res) => {
	await InvoiceDetail.drop();
	await Invoiced.drop();

	return res.status(200).json({
		status: "success",
		message: "Deleted Successfuly🔥🔥🔥",
	});
});

export default {
	create,
	index,
	approve,
	update,
	payment,
	allPayments,
	paymentsByCompany,
	show,
	deleteAll,
	destroy,
};
