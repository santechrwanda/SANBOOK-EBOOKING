import {
	Reservation,
	CompanyReservation,
	Customer,
	Room,
	RoomClass,
	DatesIn,
	Hall,
	Role,
	User,
	HallService,
	ReservationService,
	ReservationTransaction,
	PetitStockReservation,
	CompanyRoom,
	PetitStockSale,
	CustomerBill,
	CustomerBillDetail,
	Product,
	Package,
	ServiceTransaction,
	Service,
	ServiceCategory,
	PetitStock,
} from "../models";
import { asyncWrapper } from "../utils/handlingTryCatchBlocks";
import currencyController from "./currencyController";
import generateId from "../utils/generateChonologicId";
import { availableRooms } from "../utils/reservationFunctions";

const AllReservations = asyncWrapper(async (req, res) => {
	// Set up pagination options
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const offset = (page - 1) * limit;

	// const dataItems = await Reservation.findAndCountAll({
	const dataItems = await Reservation.findAll({
		include: [
			{ model: Customer, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: Room,
				attributes: { exclude: ["createdAt", "updatedAt"] },
				include: [{ model: RoomClass }],
			},
			{ model: Hall, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: DatesIn, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: PetitStockSale },
			{
				model: ServiceTransaction,
				include: [
					{
						model: Service,
					},
					{
						model: ServiceCategory,
					},
				],
			},
			{
				model: CustomerBill,
				include: [
					{
						model: CustomerBillDetail,
						attributes: { exclude: ["createdAt", "updatedAt"] },
						include: [
							{
								model: Product,
								attributes: { exclude: ["createdAt", "updatedAt"] },
								include: [
									{
										model: Package,
										attributes: { exclude: ["createdAt", "updatedAt"] },
									},
								],
							},
							{
								model: Package,
								attributes: { exclude: ["createdAt", "updatedAt"] },
							},
						],
					},
					{
						model: PetitStock,
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
			},
			{
				model: User,
				include: [
					{
						model: Role,
						attributes: {
							exclude: ["createdAt", "updatedAt", "access", "permission"],
						},
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"refreshToken",
						"password",
						"roleId",
					],
				},
			},
			{
				model: HallService,
				attributes: {
					exclude: ["createdAt", "updatedAt"],
				},
			},
			{
				model: ReservationTransaction,
				attributes: { exclude: ["createdAt", "updated"] },
			},
			{
				model: PetitStockReservation,
			},
		],
		order: [["createdAt", "DESC"]],
	});

	// const totalPages = Math.ceil(dataItems.count / limit);
	const currentPage = parseInt(page);
	const itemsPerPage = parseInt(limit);

	// const totalItems = dataItems.rows.length;
	// const totalPages = Math.ceil(totalItems / limit);

	return res.status(200).json({ status: "ok", data: dataItems });
	// return res.status(200).json({ status: "ok", data : {
	//   offset,
	//   totalItems,
	//   totalPages,
	//   currentPage,
	//   itemsPerPage,
	//   items: dataItems.rows
	// } });
});

const CreateReservation = asyncWrapper(async (req, res, next) => {
	const validationArr = ["datesIn", "booking_type", "customerId"];
	let errors;
	let is_valid = true;
	let customer;
	validationArr.forEach((item) => {
		if (!req.body[item]) {
			errors += item;
		}
	});

	if (!is_valid) {
		return res.status(400).json({ error: `${errors} are required` });
	}
	if (!req.body.roomId && !req.body.hallId && !req.body.details) {
		return res.status(400).json({
			error: "roomId, hallId and details can't both be empty",
			message: "roomId, hallId and details can't both be empty",
		});
	}

	if (req.body?.customerId && !req.createdCustomer) {
		customer = await Customer.findByPk(req.body.customerId);
		if (!customer) {
			return res
				.status(404)
				.json({ status: `error`, message: "customer not found" });
		}
	} else if (req.createdCustomer) {
		customer = req.createdCustomer;
	}

	if (req.body?.userId) {
		const user = await User.findByPk(req.body.userId);

		if (!user) {
			return res
				.status(404)
				.json({ status: "error", message: "user not found" });
		}
	}

	// if (req.body.packages && req.body.packages.length) {
	// 	for (let pack of req.body.packages) {
	// 		let product = await Product.findByPk(pack.productId, {
	// 			include: [{ model: Package, where: { id: pack.packageId } }],
	// 		});

	// 		if (!product) {
	// 			return res.status(404).json({
	// 				status: "error",
	// 				message: "Product not found or not associated with a package",
	// 			});
	// 		}

	// 		if (!(await PetitStock.findByPk(pack.petitStockId))) {
	// 			return res
	// 				.status(404)
	// 				.json({ status: "error", message: "Petit stock not registered" });
	// 		}
	// 	}
	// }

	const amountObj = {};
	const paymentObj = {};
	let grandTotal;

	const amountCurrency = req.body.hallId ? "RWF" : "USD";

	const convertedAmount = await currencyController.currencyConvert(
		amountCurrency,
		"RWF",
		req.body.amount
	);
	const convertedPayment = await currencyController.currencyConvert(
		req.body.currency,
		"RWF",
		req.body.payment
	);

	amountObj[req.body.currency] = req.body.amount;

	if (req.body.hallId) {
		amountObj["RWF"] = Math.round(req.body.amount);
	} else {
		amountObj["USD"] = Math.round(req.body.amount);
	}

	amountObj.RWF = Math.round(convertedAmount);

	paymentObj[req.body.currency] = req.body.payment;
	paymentObj.RWF = Math.round(convertedPayment);

	if (paymentObj.RWF > amountObj.RWF) {
		return res.status(400).json({
			status: "error",
			message: "Payment amaunt can't exceed possible amount RWF",
		});
	}
	let affiliation = null;
	let reservation;
	if (req.body.affiliationId) {
		affiliation = await Customer.findByPk(req.body.customerId);
		reservation = await Reservation.create({
			...req.body,
			customerId: customer.id,
			userId: req.user.id || req.userId,
			amount: amountObj,
			grandTotal: Math.round(amount.RWF),
			payment: paymentObj,
			affiliation: affiliation,
			bookingId: `BH_${await generateId(Reservation)}`,
		});
	} else {
		reservation = await Reservation.create({
			...req.body,
			customerId: customer.id,
			userId: req.user.id || req.userId,
			amount: amountObj,
			grandTotal: Math.round(amountObj.RWF),
			payment: paymentObj,
			affiliationId: null,
			affiliation: affiliation,
			bookingId: `BH_${await generateId(Reservation)}`,
		});
	}

	Object.keys(req.body).forEach(async (key, val) => {
		let services = {};
		if (key.startsWith("service_")) {
			services.HallServiceId = Number(key.split("_")[1]);
			services.ReservationId = reservation.id;
			services.quantity = req.body[key];

			let svces = await HallService.findByPk(Number(key.split("_")[1]));
			if (svces) {
				await ReservationService.create(services);
			}
		}
	});

	console.log("reservation here", reservation);
	await DatesIn.create({
		datesIn: req.body.datesIn,
		date: new Date(),
		reservationId: reservation.id,
	});

	// if (req.body.packages && req.body.packages.length) {
	// 	for (let pack of req.body.packages) {
	// 		await PetitStockReservation.create({
	// 			packageId: pack.packageId,
	// 			productId: pack.productId,
	// 			quantity: pack.quantity,
	// 			status: "PENDING",
	// 			reservationId: reservation.id,
	// 			petitStockItemId: pack.petitStockId,
	// 			petitStockId: pack.petitStockId,
	// 		});
	// 	}
	// }

	//saveReservationTrans(reservation.id, req.body);

	const data = await Reservation.findByPk(reservation.id, {
		include: [
			{
				model: Customer,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{ model: Room, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: DatesIn, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: Hall,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: User,
				include: [
					{
						model: Role,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"refreshToken",
						"password",
						"roleId",
					],
				},
			},
			{
				model: HallService,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: ReservationTransaction,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
	});
	req.reservation = data;
	return res.status(201).json({ status: "ok", data });
});
const CreateCompanyReservation = asyncWrapper(async (req, res) => {
	const validationArr = ["datesIn", "booking_type", "customerId"];
	let errors;
	let is_valid = true;
	let rooms = [];
	validationArr.forEach((item) => {
		if (!req.body[item]) {
			errors += item;
		}
	});

	if (!is_valid) {
		return res.status(400).json({ error: `${errors} are required` });
	}
	if (
		(!req.body.rooms || req.body.rooms.length === 0) &&
		!req.body.hallId &&
		!req.body.details
	) {
		return res.status(400).json({
			error: "rooms, hallId and details can't both be empty",
			message: "rooms, hallId and details can't both be empty",
		});
	}

	if (req.body?.customerId) {
		const customer = await Customer.findByPk(req.body.customerId);
		if (!customer) {
			return res
				.status(404)
				.json({ status: `error`, message: "customer not found" });
		}
	}

	if (req.body?.userId) {
		const user = await User.findByPk(req.body.userId);

		if (!user) {
			return res
				.status(404)
				.json({ status: "error", message: "user not found" });
		}
	}

	const amountObj = {};
	const paymentObj = {};

	const amountCurrency = req.body.hallId ? "RWF" : "USD";

	const convertedAmount = await currencyController.currencyConvert(
		amountCurrency,
		"RWF",
		req.body.amount
	);
	const convertedPayment = await currencyController.currencyConvert(
		req.body.currency,
		"RWF",
		req.body.payment
	);

	amountObj[req.body.currency] = req.body.amount;

	if (req.body.hallId) {
		amountObj["RWF"] = Math.round(req.body.amount);
	} else {
		amountObj["USD"] = Math.round(req.body.amount);
	}

	amountObj.RWF = Math.round(convertedAmount);

	paymentObj[req.body.currency] = req.body.payment;
	paymentObj.RWF = Math.round(convertedPayment);

	if (paymentObj.RWF > amountObj.RWF) {
		return res.status(400).json({
			status: "error",
			message: "Payment amaunt can't exceed possible amount RWF",
		});
	}

	const reservation = await CompanyReservation.create({
		...req.body,
		userId: req.user.id || req.userId,
		amount: amountObj,
		payment: paymentObj,
		bookingId: `BH_${await generateId(Reservation)}`,
	});

	// Object.keys(req.body).forEach(async (key, val) => {
	// 	let services = {};
	// 	if (key.startsWith("service_")) {
	// 		services.HallServiceId = Number(key.split("_")[1]);
	// 		services.ReservationId = reservation.id;
	// 		services.quantity = req.body[key];

	// 		let svces = await HallService.findByPk(Number(key.split("_")[1]));
	// 		if (svces) {
	// 			await ReservationService.create(services);
	// 		}
	// 	}
	// });

	await DatesIn.create({
		datesIn: req.body.datesIn,
		date: new Date(),
		companyReservationId: reservation.id,
	});

	for (const id of req.body.rooms) {
		const room = await Room.findByPk(id, {
			include: [{ model: Reservation }],
		});
		rooms.push(room);
	}

	for (let i = 0; i < rooms.length; i++) {
		console.log("reservation", reservation);
		console.log("room", rooms[i]);

		rooms[i].addCompanyReservations(reservation);
		reservation.addRooms(rooms[i]);
		reservation.save();
		await CompanyRoom.create({
			roomId: rooms[i].id,
			companyReservationId: reservation.id,
		});
	}

	const data = await CompanyReservation.findByPk(reservation.id, {
		include: [
			{
				model: Customer,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{ model: Room, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: DatesIn, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: Hall,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: User,
				include: [
					{
						model: Role,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"refreshToken",
						"password",
						"roleId",
					],
				},
			},
			{
				model: ReservationTransaction,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
	});

	req.reservation = { ...data, rooms };

	return res.status(201).json({ status: "ok", data });
});

const getAvalibleRooms = asyncWrapper(async (req, res) => {
	const { dates } = req.query;
	const allRooms = await Room.findAll({
		include: [
			{ model: RoomClass },
			{
				model: Reservation,
				include: [
					{ model: Customer },
					{ model: DatesIn },
					{ model: User },
					{ model: ReservationService },
					{ model: ReservationTransaction },
				],
			},
		],
	});

	const freeRooms = availableRooms(allRooms, dates);

	res.status(200).json({
		status: "success",
		data: freeRooms,
	});
});
const PayReservation = asyncWrapper(async (req, res) => {
	if (!req.body?.reservationId) {
		return res
			.status(400)
			.json({ status: "error", message: " Reservation Id is required " });
	}

	if (!req.body?.payment || !req.body?.currency) {
		return res.status(400).json({
			status: "error",
			message: "The payment amount and currency is required",
		});
	}

	const reservation = await Reservation.findByPk(req.body.reservationId);
	if (!reservation) {
		return res
			.status(404)
			.json({ status: "error", message: "Reservation not found in database" });
	}

	if (!req.body.paymentMethod) {
		return res
			.status(400)
			.json({ status: "error", message: "Payment Method is required" });
	}

	if (reservation.payment[req.body.currency] == undefined) {
		return res.status(400).json({
			status: "error",
			message: "Payment currency should be the same",
		});
	}

	const transction = saveReservationTrans(req.body.reservationId, {
		...req.body,
		amount: parseInt(req.body.payment),
	});

	let amountObj = reservation.amount;
	let paymentObj = reservation.payment;
	let grandTotal = reservation.grandTotal;

	if (transction) {
		let paymentCurrency = req.body.currency.toString();

		if (paymentCurrency in paymentObj) {
			for (let key in paymentObj) {
				paymentObj[key] =
					Number(paymentObj[key]) +
					Number(
						await currencyController.currencyConvert(
							req.body.currency,
							key,
							req.body.payment
						)
					);
			}
		} else {
			return res.status(400).json({
				status: "error",
				message: "Payment currency #",
			});
		}
	}

	if (grandTotal && paymentObj.RWF > grandTotal) {
		return res.status(400).json({
			status: "error",
			message: "Payment amount can not go beyond the price of the service",
		});
	}

	await Reservation.update(
		{
			amount: amountObj,
			payment: paymentObj,
			grandTotal: grandTotal - reservation.amount.RWF + amountObj.RWF,
		},
		{ where: { id: req.body.reservationId } }
	);

	const newReservation = await Reservation.findByPk(req.body.reservationId, {
		include: [
			{ model: Customer, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: Room,
				attributes: { exclude: ["createdAt", "updatedAt"] },
				include: { model: RoomClass },
			},
			{ model: Hall, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: DatesIn, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: User,
				include: [
					{
						model: Role,
						attributes: {
							exclude: ["createdAt", "updatedAt", "access", "permission"],
						},
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"refreshToken",
						"password",
						"roleId",
					],
				},
			},
			{
				model: HallService,
				attributes: {
					exclude: ["createdAt", "updatedAt"],
				},
			},
			{
				model: ReservationTransaction,
				attributes: { exclude: ["createdAt", "updated"] },
			},
			{
				model: PetitStockReservation,
			},
		],
	});

	return res.status(200).json({
		status: "success",
		message: ` The amaunt ${req.body.payment} is paid for the reservation ${reservation.id} `,
		data: reservation,
	});
});

const GetReservation = async (req, res) => {
	if (!req.params.id) return res.status(400).json({ error: "id is required" });

	const reservation = await Reservation.findByPk(req.params.id, {
		include: Customer,
	});

	if (!reservation)
		return res.status(404).json({
			status: "error",
			message: "Reservation not with this id not found",
		});

	return res.status(200).json({ status: "ok", data: reservation });
};

const UpdateReservation = async (req, res) => {
	if (!req.body.id)
		return res.status(400).json({ status: "error", message: "id is required" });
	const reservation = await Reservation.findByPk(req.body.id);

	if (!reservation)
		return res
			.status(404)
			.json({ status: "error", message: "Reservation not found" });

	await Reservation.update(
		{ status: req.body.status },
		{ where: { id: req.body.id } }
	);
	const newReservation = await Reservation.findByPk({
		id: req.body.id,
		include: [
			{ model: Customer, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: Room,
				attributes: { exclude: ["createdAt", "updatedAt"] },
				include: [{ model: RoomClass }],
			},
			{ model: Hall, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: DatesIn, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: PetitStockSale },
			{
				model: ServiceTransaction,
				include: [
					{
						model: Service,
					},
					{
						model: ServiceCategory,
					},
				],
			},
			{
				model: CustomerBill,
				include: [
					{
						model: CustomerBillDetail,
						attributes: { exclude: ["createdAt", "updatedAt"] },
						include: [
							{
								model: Product,
								attributes: { exclude: ["createdAt", "updatedAt"] },
								include: [
									{
										model: Package,
										attributes: { exclude: ["createdAt", "updatedAt"] },
									},
								],
							},
							{
								model: Package,
								attributes: { exclude: ["createdAt", "updatedAt"] },
							},
						],
					},
					{
						model: PetitStock,
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
			},
			{
				model: User,
				include: [
					{
						model: Role,
						attributes: {
							exclude: ["createdAt", "updatedAt", "access", "permission"],
						},
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"refreshToken",
						"password",
						"roleId",
					],
				},
			},
			{
				model: HallService,
				attributes: {
					exclude: ["createdAt", "updatedAt"],
				},
			},
			{
				model: ReservationTransaction,
				attributes: { exclude: ["createdAt", "updated"] },
			},
			{
				model: PetitStockReservation,
			},
		],
	});
	return res.status(200).json({ status: "ok", data: newReservation });
};
const Checkout = async (req, res) => {
	if (!req.body.id)
		return res.status(400).json({ status: "error", message: "id is required" });
	const reservation = await Reservation.findByPk(req.body.id);

	if (!reservation)
		return res
			.status(404)
			.json({ status: "error", message: "Reservation not found" });

	await Reservation.update(
		{ roomStatus: "checked-out" },
		{ where: { id: req.body.id } }
	);

	return res.status(200).json({ status: "success", data: reservation });
};
const CheckIn = async (req, res) => {
	const reservation = await Reservation.findByPk(req.reservation.id);

	if (!reservation)
		return res
			.status(404)
			.json({ status: "error", message: "Reservation not found" });

	await Reservation.update(
		{ roomStatus: "occupied", status: "confirmed" },
		{ where: { id: req.reservation.id } }
	);

	return res.status(200).json({ status: "success", data: reservation });
};

const updateReservationDates = asyncWrapper(async (req, res) => {
	const id = req.body?.id;
	if (!id) {
		return res
			.status(400)
			.json({ status: "error", message: "Reservation id is required" });
	}

	const reservation = await Reservation.findByPk(req.body.id);

	if (!reservation) {
		return res
			.status(400)
			.json({ status: "error", message: "Reservation not available" });
	}

	if (req.body.datesIn) {
		const newDatesIn = await DatesIn.create({
			datesIn: req.body.datesIn,
			date: new Date(),
			reservationId: reservation.id,
		});

		const amountObj = {};
		const paymentObj = {};

		const convertedAmount = await currencyController.currencyConvert(
			req.body.currency || req.body.newCurrency,
			"RWF",
			req.body.amount
		);
		let grandTotal = reservation.grandTotal;

		amountObj[req.body.currency] = req.body.amount;
		amountObj.RWF = convertedAmount;

		if (paymentObj.RWF > amountObj.RWF) {
			return res.status(400).json({
				status: "error",
				message: "Payment amaunt can't exceed possible amount RWF",
			});
		}

		reservation.grandTotal =
			reservation.grandTotal - reservation.amount.RWF + amountObj.RWF;
		reservation.amount = amountObj;
		await reservation.save();
	}

	const newReservation = await Reservation.findByPk(reservation.id, {
		include: [
			{
				model: Customer,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{ model: Room, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{ model: DatesIn },
			{
				model: Hall,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: User,
				include: [
					{
						model: Role,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"refreshToken",
						"password",
						"roleId",
					],
				},
			},
			{
				model: HallService,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
			{
				model: ReservationTransaction,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
	});

	return res.status(200).json({ status: "ok", data: newReservation });
});
const ChechOutReservation = async (req, res) => {
	if (!req.params.id) return res.status(400).json({ error: "id is required" });

	const reservation = await Reservation.findByPk(req.params.id);
	if (!reservation)
		return res
			.status(404)
			.json({ status: "error", message: "Reservation not found" });

	await reservation.update({ status: "out" });

	return res.status(200).json({ status: "ok", data: reservation });
};

const saveReservationTrans = asyncWrapper(async (reservationId, options) => {
	await ReservationTransaction.create({
		date: new Date(),
		payment: options.payment,
		paymentMethod: options.paymentMethod,
		currency: options.currency,
		amount: options.amount,
		reservationId,
	});
});
const DeleteReservation = asyncWrapper(async (req, res) => {
	const id = req.params?.id;
	if (!id) {
		return res
			.status(400)
			.json({ status: "error", message: "Reservation id is required" });
	}

	const reservation = await Reservation.findByPk(id);

	if (!reservation) {
		return res
			.status(404)
			.json({ status: "error", message: "Reservation not found" });
	}

	await reservation.destroy();

	return res
		.status(200)
		.json({ status: "success", message: "Reservation successfully deleted" });
});

const deleteAllReservations = asyncWrapper(async (req, res) => {
	const reservations = await Reservation.findAll();

	for (let i = 0; i < reservations.length; i++) {
		await reservations[i].destroy({ cascade: true });
	}
	return res.status(200).json({
		status: "success !!!",
		message: "🔥🔥🔥🔥🔥",
	});
});

export default {
	deleteAllReservations,
	CreateCompanyReservation,
	updateReservationDates,
	DeleteReservation,
	AllReservations,
	PayReservation,
	CheckIn,
	Checkout,
	CreateReservation,
	UpdateReservation,
	ChechOutReservation,
	GetReservation,
	getAvalibleRooms,
};
