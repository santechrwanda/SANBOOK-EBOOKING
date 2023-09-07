import {
	PurchaseOrderAccountant,
	PurchaseOrderAccountantDetail,
	User,
} from "../../models";

import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generate from "../../utils/generateChonologicId";

const create = asyncWrapper(async (req, res) => {
	const data = req.body;

	if (!data.details || !data.clientName || !data.clientType || !data.function) {
		return res.status(400).json({
			status: "error",
			message: "details ,clientName, clientType , function is requried ",
		});
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

	const purchaseOrder = await PurchaseOrderAccountant.create({
		userId: req?.user?.id,
		clientName: data.clientName,
		clientType: data.clientType,
		function: data.function,
		total: data.total,
		pax: data.pax,
		vatTotal: data.vatTotal,
		status: "PENDING",
		POGenerated: `PO_${await generate(PurchaseOrderAccountant)}`,
	});

	for (let element of data.details) {
		await PurchaseOrderAccountantDetail.create({
			name: element.name,
			times: element.times,
			quantity: element.quantity,
			price: element?.price || element?.unitPrice,
			VAT: element.VAT,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
			purchaseOrderAccountantId: purchaseOrder.id,
		});
	}

	const order = await PurchaseOrderAccountant.findByPk(purchaseOrder.id, {
		include: {
			model: PurchaseOrderAccountantDetail,
			attributes: { exclude: ["createdAt", "updatedAt"] },
		},
	});

	return res.status(200).json({
		status: "success",
		message: "Purchase order created Successfully !! ",
		data: order,
	});
});

const index = asyncWrapper(async (req, res) => {
	const data = await PurchaseOrderAccountant.findAll({
		include: [
			{
				model: PurchaseOrderAccountantDetail,
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

const update = asyncWrapper(async (req, res) => {
	const { id, clientDetails, details } = req.body;
	if (!id || !details || !clientDetails)
		return res.status(404).json({
			status: "error",
			message: "The ID, clientDetails and Details are all  required",
		});
	const pOrder = await PurchaseOrderAccountant.findByPk(id);
	if (!pOrder) {
		return res.status(404).json({
			status: "error",
			message: "The invoice does not exist",
		});
	}

	await PurchaseOrderAccountantDetail.destroy({
		where: { purchaseOrderAccountantId: pOrder.id },
		truncate: true,
	});

	for (let element of details) {
		await PurchaseOrderAccountantDetail.create({
			name: element.name,
			times: element.times,
			quantity: element.quantity,
			price: element?.price || element?.unitPrice,
			VAT: element.VAT,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
			purchaseOrderAccountantId: pOrder.id,
		});
	}

	await PurchaseOrderAccountant.update(
		{
			clientName: clientDetails.clientName,
			pax: clientDetails.pax,
			function: clientDetails.function,
			clientType: clientDetails.clientType,
			total: clientDetails.total,
			currency: clientDetails.currency,
			vatTotal: clientDetails.vatTotal,
		},
		{ where: { id: pOrder.id } }
	);

	await pOrder.save();

	const newPOrder = await PurchaseOrderAccountant.findByPk(pOrder.id, {
		include: [{ model: PurchaseOrderAccountantDetail }],
	});

	return res
		.status(200)
		.json({ status: "OK", message: "updated !!!", data: newPOrder });
});

const destroy = asyncWrapper(async (req, res) => {
	if (!req.body.id) {
		return res.status(401).json({
			status: "failed",
			message: "Purchase order id",
		});
	}

	const purchase = await PurchaseOrderAccountant.findByPk(req.body.id);

	if (!purchase) {
		return res.status(401).json({
			status: "failed",
			message: "purchase order not found",
		});
	}
	await purchase.destroy({ truncate: true });

	console.log("urchase", purchase);
	res.status(200).json({
		status: "success",
		message: "purchase order deleted successfully",
		data: { id: purchase.id },
	});
});

const deleteAll = asyncWrapper(async (req, res) => {
	const all = await PurchaseOrderAccountant.findAll();

	for (let i = 0; i < all.length; i++) {
		all[i].destroy({ truncate: true });
	}

	return res.status(200).json({
		status: "success",
		message: "Deleted Successfuly🔥🔥🔥",
	});
});

export default { create, index, update, destroy, deleteAll };
