import {
	HotelEvent,
	HotelEventDetail,
	User,
	Role,
	HotelEventSheet,
} from "../models";
import { asyncWrapper } from "../utils/handlingTryCatchBlocks";
import generate from "../utils/generateChonologicId";

const create = asyncWrapper(async (req, res) => {
	const data = req.body;

	if (
		!data.details ||
		!data.location ||
		!data.customerName ||
		!data.startDate ||
		!data.endDate ||
		!data.pax ||
		!data.price_per_day ||
		!data.function
	) {
		return res.status(400).json({
			status: "error",
			message: "details , location , function is requried ",
		});
	}

	for (let dataElement of data.details) {
		if (
			!dataElement.quantity ||
			!dataElement.days ||
			(!dataElement.price && !dataElement.unitPrice) ||
			!dataElement.name
		) {
			return res.status(400).json({
				status: "error",
				message: `Quantity, days, price and name are both required under details`,
			});
		}
	}

	const eventCreated = await HotelEvent.create({
		customerName: data.customerName,
		telephone: data.telephone,
		price_per_day: data.price_per_day,
		pax: data.pax,
		location: data.location,
		function: data.function,
		startDate: data.startDate,
		endDate: data.endDate,
		status: "PENDING",
		hallId: req.body.hallId,
		enventGenerated: `EV_${await generate(HotelEvent)}`,
		userId: req?.user?.id,
	});

	for (let element of data.details) {
		await HotelEventDetail.create({
			name: element.name,
			quantity: element.quantity,
			days: element.days,
			price: element.price,
			comment: element.comment,
			date: element.date,
			eventId: eventCreated.id,
		});
	}

	const hotelEvent = await HotelEvent.findByPk(eventCreated.id, {
		include: {
			model: HotelEventDetail,
			attributes: { exclude: ["createdAt", "updatedAt"] },
		},
	});

	return res.status(200).json({
		status: "success",
		message: " Successfull Delivery note created sent",
		data: hotelEvent,
	});
});

const index = asyncWrapper(async (req, res) => {
	const all = await HotelEventDetail.findAll();
	const data = await HotelEvent.findAll({
		include: [
			{
				model: HotelEventDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: HotelEventSheet,
				include: [
					{
						model: User,
						include: { model: Role },
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
	const invoice = await HotelEvent.findByPk(id);
	if (!invoice) {
		return res.status(404).json({
			status: "error",
			message: "The HotelEvent does not exist",
		});
	}

	await HotelEventDetail.destroy({
		where: { eventId: invoice.id },
		truncate: true,
	});

	for (let element of details) {
		await HotelEventDetail.create({
			name: element.name,
			quantity: element.quantity,
			days: element.days,
			price: element.price,
			date: element.date,
			comment: element.comment,
			eventId: invoice.id,
		});
	}

	await HotelEvent.update(
		{
			customerName: clientDetails.customerName,
			telephone: clientDetails.telephone,
			price_per_day: clientDetails.price_per_day,
			pax: clientDetails.pax,
			location: clientDetails.location,
			function: clientDetails.function,
			startDate: clientDetails.startDate,
			endDate: clientDetails.endDate,
			status: clientDetails.status,
		},
		{ where: { id: invoice.id } }
	);

	await invoice.save();

	const newInvoice = await HotelEvent.findByPk(invoice.id, {
		include: [{ model: HotelEventDetail }],
	});

	return res
		.status(200)
		.json({ status: "OK", message: "updated !!!", data: newInvoice });
});
const confirm = asyncWrapper(async (req, res) => {
	const { id } = req.body;
	if (!id)
		return res.status(404).json({
			status: "error",
			message: "The ID is required",
		});

	let invoice = await HotelEvent.findByPk(id, {
		include: [
			{
				model: HotelEventDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["updatedAt"] },
	});

	if (!invoice)
		return res.status(404).json({
			status: "error",
			message: "HotelEvent not found",
		});

	await HotelEvent.update({ status: "APPROVED" }, { where: { id } });

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

	const data = await HotelEvent.findByPk(req.params.id, {
		include: [
			{
				model: HotelEventDetail,
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

	const invoice = await HotelEvent.findByPk(req.body.id);

	if (!invoice) {
		return res
			.status(200)
			.json({ status: "success", message: " InvoiceDetail not found" });
	}

	await invoice.destroy({
		include: [
			{
				model: HotelEventDetail,
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
	await HotelEventDetail.drop();
	await HotelEvent.drop();

	return res.status(200).json({
		status: "success",
		message: "Deleted Successfuly🔥🔥🔥",
	});
});

const createEventSheet = asyncWrapper(async (req, res) => {
	const { eventId, date } = req.body;
	if (!eventId || !date) {
		return res.status(400).json({
			status: "failed",
			message: "must provide the event id and date",
		});
	}

	const eventSheet = await HotelEventSheet.create({
		date: new Date(date).getTime(),
		hoteleventId: eventId,
		details: req.body.details,
		userId: req?.user?.id,
	});
	return res.status(200).json({
		status: "success",
		data: eventSheet,
	});
});
const updateEventSheet = asyncWrapper(async (req, res) => {
	const { id } = req.body;
	if (!id) {
		return res.status(400).json({
			status: "failed",
			message: "must provide the event sheet id",
		});
	}
	await HotelEventSheet.update(
		{ details: req.body.details },
		{ where: { id } }
	);
	const eventSheet = await HotelEventSheet.findOne({
		where: { id },
	});
	return res.status(200).json({
		status: "success",
		data: eventSheet,
	});
});

const deleteEventSheet = asyncWrapper(async (req, res) => {
	const { id } = req.body;
	if (!id) {
		return res.status(400).json({
			status: "failed",
			message: "Please provide the event sheet id",
		});
	}

	const eventSheet = await HotelEventSheet.findOne({ where: { id } });

	if (eventSheet) {
		await eventSheet.destroy({ truncate: true });

		return res.status(200).json({
			status: "success",
			data: eventSheet,
		});
	} else {
		return res.status(400).json({
			status: "Event sheet not found !",
			message: "You need to provide the event sheet id",
		});
	}
});

export default {
	create,
	index,
	confirm,
	update,
	show,
	deleteAll,
	destroy,
	createEventSheet,
	updateEventSheet,
	deleteEventSheet,
};
