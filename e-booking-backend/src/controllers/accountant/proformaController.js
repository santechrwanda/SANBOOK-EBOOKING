import { ProformaInvoice, ProformaDetail, User } from "../../models";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generateId from "../../utils/generateChonologicId";

const create = asyncWrapper(async (req, res) => {
	const data = req.body;

	if (!data.details || !data.clientName || !data.clientType || !data.function) {
		return res.status(400).json({
			status: "error",
			message: "Details ,clientName, clientType  is requried ",
		});
	}
	let total = 0;

	for (let dataElement of data.details) {
		if (
			!dataElement.quantity ||
			!dataElement.times ||
			!dataElement.price ||
			!dataElement.name
		) {
			return res.status(404).json({
				status: "error",
				message: `Quantity, times, price and name are both required under details`,
			});
		}
	}

	const invoice = await ProformaInvoice.create({
		userId: req?.user?.id,
		clientName: data.clientName,
		clientType: data.clientType,
		function: data.function,
		dateIn: data.dateIn,
		dateOut: data.dateOut,
		total: data.total,
		currency: data.currency,
		pax: data.pax,
		vatTotal: data.vatTotal,
		status: "PENDING",
		proformaGenerated: `PI_${await generateId(ProformaInvoice)}`,
	});

	for (let element of data.details) {
		await ProformaDetail.create({
			name: element.name,
			times: element.times,
			quantity: element.quantity,
			price: element.price,
			VAT: element.VAT,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
			invoiceId: invoice.id,
		});
	}

	const delivery = await ProformaInvoice.findByPk(invoice.id, {
		include: {
			model: ProformaDetail,
			attributes: { exclude: ["createdAt", "updatedAt"] },
		},
	});

	return res.status(200).json({
		status: "success",
		message: " Successfully created sent",
		data: delivery,
	});
});

const index = asyncWrapper(async (req, res) => {
	const data = await ProformaInvoice.findAll({
		include: [
			{
				model: ProformaDetail,
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

const approve = asyncWrapper(async (req, res) => {
	const { id } = req.body;
	if (!id)
		return res.status(404).json({
			status: "error",
			message: "The ID is required",
		});

	let invoice = await ProformaInvoice.findByPk(id, {
		include: [
			{
				model: ProformaDetail,
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

	await ProformaInvoice.update({ status: "APPROVED" }, { where: { id } });

	return res
		.status(200)
		.json({ status: "OK", message: "ProformaInvoice approved", data: invoice });
});

const update = asyncWrapper(async (req, res) => {
	const { id, clientDetails, details } = req.body;
	if (!id || !details || !clientDetails)
		return res.status(404).json({
			status: "error",
			message: "The ID, clientDetails and Details are all  required",
		});
	const proinvoice = await ProformaInvoice.findByPk(id);
	if (!proinvoice) {
		return res.status(404).json({
			status: "error",
			message: "The proinvoice does not exist",
		});
	}

	await ProformaDetail.destroy({
		where: { invoiceId: proinvoice.id },
		truncate: true,
	});

	for (let element of details) {
		await ProformaDetail.create({
			name: element.name,
			times: element.times,
			quantity: element.quantity,
			price: element?.price || element?.unitPrice,
			VAT: element.VAT,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
			invoiceId: proinvoice.id,
		});
	}

	await ProformaInvoice.update(
		{
			clientName: clientDetails.clientName,
			pax: clientDetails.pax,
			vatTotal: clientDetails.vatTotal,
			function: clientDetails.function,
			clientType: clientDetails.clientType,
			total: clientDetails.total,
		},
		{ where: { id: proinvoice.id } }
	);

	await proinvoice.save();

	const newInvoice = await ProformaInvoice.findByPk(proinvoice.id, {
		include: [{ model: ProformaDetail }],
	});

	return res
		.status(200)
		.json({ status: "OK", message: "updated !!!", data: newInvoice });
});
const show = asyncWrapper(async (req, res) => {
	if (!req.params.id) {
		return res
			.status(400)
			.json({ status: "error", message: " Id is required" });
	}

	const data = await ProformaInvoice.findByPk(req.params.id, {
		include: [
			{
				model: ProformaDetail,
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

	const proforma = await ProformaInvoice.findByPk(req.body.id);

	if (!proforma) {
		return res
			.status(200)
			.json({ status: "success", message: " ProformaDetail not found" });
	}

	await proforma.destroy({
		include: [
			{
				model: ProformaDetail,
				as: "ProformaDetails",
			},
		],
		truncate: true,
	});
	return res.status(200).json({
		status: "success",
		message: "ProformaDetail successfully destroyed",
		data: { id: proforma.id },
	});
});

const deleteAll = asyncWrapper(async (req, res) => {
	await ProformaInvoiceDetail.drop();
	await ProformaInvoice.drop();

	return res.status(200).json({
		status: "success",
		message: "Deleted Successfuly🔥🔥🔥",
	});
});

export default { create, index, update, approve, show, deleteAll, destroy };
