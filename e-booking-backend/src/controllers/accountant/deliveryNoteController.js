import { DeliveryNote, DeliveryNoteDetail } from "../../models";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generateId from "../../utils/generateChonologicId";

const create = asyncWrapper(async (req, res) => {
	const data = req.body;

	if (!data.details) {
		return res
			.status(400)
			.json({ status: "error", message: "The details is requried " });
	}

	let total = 0;

	for (let dataElement of data.details) {
		if (!dataElement.quantity || !dataElement.times) {
			return res.status(404).json({
				status: "error",
				message: `Quantity and times are required`,
			});
		}
		total = total + Number(dataElement.unitPrice * dataElement.quantity);
	}

	const deliveryNote = await DeliveryNote.create({
		userId: req?.user?.id,
		clientName: data.clientName,
		clientType: data.clientType,
		function: data.function,
		currency: data.currency,
		total: data.total,
		pax: data.pax,
		status: "PENDING",
		deliveryNoteId: `DN_${await generateId(DeliveryNote)}`,
	});

	for (let element of data.details) {
		await DeliveryNoteDetail.create({
			description: element.description,
			times: element.times,
			unitPrice: element.unitPrice,
			quantity: element.quantity,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
			deliveryId: deliveryNote.id,
		});
	}

	const delivery = await DeliveryNote.findByPk(deliveryNote.id, {
		include: {
			model: DeliveryNoteDetail,
			attributes: { exclude: ["createdAt", "updatedAt"] },
		},
		attributes: { exclude: ["createdAt", "updatedAt"] },
	});

	return res.status(200).json({
		status: "success",
		message: " Successfull Delivery note created sent ",
		data: delivery,
	});
});

const index = asyncWrapper(async (req, res) => {
	const data = await DeliveryNote.findAll({
		include: {
			model: DeliveryNoteDetail,
			attributes: { exclude: ["createdAt", "updatedAt"] },
		},
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
	const delivery = await DeliveryNote.findByPk(id);
	if (!delivery) {
		return res.status(404).json({
			status: "error",
			message: "The invoice does not exist",
		});
	}

	await DeliveryNoteDetail.destroy({
		where: { deliveryId: delivery.id },
		truncate: true,
	});

	for (let element of details) {
		await DeliveryNoteDetail.create({
			description: element.name,
			times: element.times,
			quantity: element.quantity,
			unitPrice: element?.price || element?.unitPrice,
			VAT: element.VAT,
			deliveryId: delivery.id,
			date: new Date(element.date) === "Invalid date" ? null : element.date,
		});
	}

	await DeliveryNote.update(
		{
			clientName: clientDetails.clientName,
			pax: clientDetails.pax,
			function: clientDetails.function,
			clientType: clientDetails.clientType,
			total: clientDetails.total,
			currency: clientDetails.currency,
			vatTotal: clientDetails.vatTotal,
		},
		{ where: { id: delivery.id } }
	);

	await delivery.save();

	const newDelivery = await DeliveryNote.findByPk(delivery.id, {
		include: [{ model: DeliveryNoteDetail }],
	});

	return res
		.status(200)
		.json({ status: "OK", message: "updated !!!", data: newDelivery });
});
const approve = asyncWrapper(async (req, res) => {
	const { id } = req.body;
	if (!request)
		return res.status(404).json({
			status: "error",
			message: "The ID is required",
		});

	let delivery = await DeliveryNote.findByPk(id, {
		include: [
			{
				model: DeliveryNoteDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
	});

	if (!delivery)
		return res.status(404).json({
			status: "error",
			message: "Delivery note related to this Id not found",
		});

	await DeliveryNote.update({ status: "APPROVED" }, { where: { id } });

	return res
		.status(200)
		.json({ status: "OK", message: "Request approved", data: delivery });
});

const show = asyncWrapper(async (req, res) => {
	if (!req.params.id) {
		return res
			.status(400)
			.json({ status: "error", message: " Id is required" });
	}

	const data = await DeliveryNote.findByPk(req.params.id, {
		include: [
			{
				model: DeliveryNoteDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt"] },
	});

	return res.status(200).json({ status: "Ok", data });
});

const destroy = asyncWrapper(async (req, res) => {
	if (!req.body.id) {
		return res.status(400).json({ status: "error", message: "Id is required" });
	}

	const request = await DeliveryNote.findByPk(req.body.id);

	if (!request) {
		return res
			.status(200)
			.json({ status: "success", message: "Delivery not found" });
	}
	console.log("request", request);

	await request.destroy({ truncate: true });
	return res.status(200).json({
		status: "success",
		message: "Request successfully destroyed",
		data: { id: request.id },
	});
});

const deleteAll = asyncWrapper(async (req, res) => {
	await DeliveryNoteDetail.drop();
	await DeliveryNote.drop();

	return res.status(200).json({
		status: "success",
		message: "Deleted Successfuly🔥🔥🔥",
	});
});
export default { create, index, approve, show, update, destroy, deleteAll };
