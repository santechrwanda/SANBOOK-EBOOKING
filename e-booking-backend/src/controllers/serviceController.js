import {
	Service,
	ServiceCategory,
	ServiceTransaction,
	User,
	Room,
	Reservation,
} from "../models";
import { asyncWrapper } from "../utils/handlingTryCatchBlocks";
import generate from "../utils/generateChonologicId";

const { Op } = require("sequelize"); // Import Sequelize's operator for partial string search

const CreateService = asyncWrapper(async (req, res) => {
	if (!req.body?.name || !req.body?.category) {
		return res
			.status(400)
			.json({ status: "error", message: "Name and Category is required" });
	}

	if (await Service.findOne({ where: { name: req.body.name } })) {
		return res
			.status(409)
			.json({ status: "error", message: "Duplication error" });
	}

	const category = await ServiceCategory.findByPk(req.body.category, {
		include: [{ model: Service }],
	});

	if (!category)
		return res
			.status(404)
			.json({ status: "error", message: "Category not found" });

	const service = await Service.create({
		name: req.body.name,
		service_categoryId: req.body.category,
		price: req.body.price,
	});
	return res.status(200).json({ status: "ok", data: service });
});

const UpdateService = asyncWrapper((req, res) => {
	if (!req.body.id) {
		return res
			.status(404)
			.json({ status: "error", message: "Service not found" });
	}

	const service = Service.findByPk(req.body.id);
	if (!service)
		return res
			.status(404)
			.json({ status: "error", message: "Service not found" });

	Service.set({
		name: req.body.name ? req.body.name : service.name,
		service_categoryId: req.body.category
			? req.body.category
			: Service.category,
		price: req.body.price ? req.body.price : service.price,
	});
});

const DeleteService = asyncWrapper(async (req, res) => {
	if (!req.params.id) {
		return res
			.status(404)
			.json({ status: "error", message: "Service Id is required" });
	}

	const service = Service.findByPk(req.params.id);

	if (!service)
		return res
			.status(404)
			.json({ status: "error", message: "Service not found" });

	await service.destroy();
	return res.status(200).json({ status: "ok", message: "Service deleted" });
});

const GetAllServices = asyncWrapper(async (req, res) => {
	const services = await Service.findAll({
		include: [ServiceCategory],
		order: [["createdAt", "DESC"]],
	});
	return res.status(200).json({ status: "ok", data: services });
});

const GetServiceById = asyncWrapper(async (req, res) => {
	if (!req.params.id)
		return res
			.status(400)
			.json({ status: "error", message: "Service id is required" });

	const service = Service.findByPk(req.params.id);
	if (!service) {
		return res
			.status(404)
			.json({ status: "error", message: "Service not found" });
	}
	return res.status(200).json({ status: "ok", data: service });
});

const sell = asyncWrapper(async (req, res) => {
	const { serviceId, client_name, service_categoryId, times, paymentMethod } =
		req.body;

	if (!serviceId) {
		return res
			.status(400)
			.json({ status: "error", message: "Service ID not specified" });
	}

	if (!client_name) {
		return res.status(400).json({
			status: "error",
			message: " Client name not specified or empty",
		});
	}

	const service = await Service.findByPk(serviceId);

	if (!service) {
		return res
			.status(404)
			.json({ status: "error", message: " Service not found" });
	}

	const serviceTran = await ServiceTransaction.create({
		client_name,
		serviceId,
		service_categoryId,
		paymentMethod,
		reservationId: req.body.reservationId
			? Number(req.body.reservationId)
			: null,
		status: "PENDING",
		total: Number(service.price * times),
		userId: req.user.id,
		serviceSellId: `_${await generate(ServiceTransaction)}`,
	});
	//updating reservation grand total
	if (serviceTran && req.body.reservationId && req.body.reservationId !== "") {
		const reservation = await Reservation.findByPk(
			Number(req.body.reservationId)
		);

		await Reservation.update(
			{
				grandTotal:
					Number(reservation.grandTotal) + Number(service.price * times),
			},
			{ where: { id: Number(req.body.reservationId) } }
		);
	}

	return res.status(200).json({
		status: "success",
		message: "sold successfully",
		data: serviceTran,
	});
});

const addServiceTransToReservation = asyncWrapper(async (req, res) => {
	const { id, reservationId } = req.body;
	const bill = await ServiceTransaction.findByPk(id);
	const reservation = await Reservation.findByPk(reservationId);

	if (!bill || !reservationId) {
		return res.status(404).json({
			status: "failed",
			message: "customer bill or  reservation  not found",
		});
	}

	const newBill = await ServiceTransaction.update(
		{ reservationId: reservationId },
		{ where: { id } }
	);
	await Reservation.update(
		{ grandTotal: Number(reservation.grandTotal + bill.total) },
		{ where: { id: reservationId } }
	);

	return res.status(200).json({
		status: "success",
		data: newBill,
	});
});
const removeServiceTransToReservation = asyncWrapper(async (req, res) => {
	const { id, reservationId } = req.body;
	const bill = await ServiceTransaction.findByPk(id);
	const reservation = await Reservation.findByPk(reservationId);

	if (!bill || !reservationId) {
		return res.status(404).json({
			status: "failed",
			message: "customer bill or  reservation  not found",
		});
	}

	const newBill = await ServiceTransaction.update(
		{ reservationId: null },
		{ where: { id } }
	);
	await Reservation.update(
		{ grandTotal: Number(reservation.grandTotal - bill.total) },
		{ where: { id: reservationId } }
	);

	return res.status(200).json({
		status: "success",
		data: newBill,
	});
});
const allSells = asyncWrapper(async (req, res) => {
	const data = await ServiceTransaction.findAll({
		include: [
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
			{
				model: Service,
			},
			{ model: Reservation, include: [{ model: Room }] },
			{
				model: ServiceCategory,
			},
		],
		order: [["createdAt", "DESC"]],
	});
	return res.status(200).json({ status: "success", data });
});

const getServiceTransaction = asyncWrapper(async (req, res) => {
	const searchTerm = req.query.billId;

	const bills = await ServiceTransaction.findAll({
		where: {
			serviceSellId: {
				[Op.iLike]: `%${searchTerm}%`, // Use ILIKE to perform case-insensitive search
			},
		},
		include: [
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
			{
				model: Service,
			},
			{
				model: ServiceCategory,
			},
		],
	});

	res.status(200).json({
		data: bills,
	});
});

export default {
	CreateService,
	UpdateService,
	DeleteService,
	GetAllServices,
	GetServiceById,
	getServiceTransaction,
	addServiceTransToReservation,
	removeServiceTransToReservation,
	sell,
	allSells,
};
