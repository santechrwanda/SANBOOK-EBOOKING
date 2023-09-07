import {
	Room,
	RoomClass,
	DatesIn,
	Reservation,
	Customer,
	PetitStock,
	PetitStockSale,
	Service,
	ServiceTransaction,
	ServiceCategory,
	Product,
	Package,
	CustomerBill,
	CustomerBillDetail,
	User,
	Role,
} from "../../models";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import { isRoomOccupied } from "../../utils/reservationFunctions";

const getAllRoom = asyncWrapper(async (req, res) => {
	let data = await Room.findAll({
		include: [
			{ model: RoomClass, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: Reservation,
				include: [
					{
						model: Customer,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
					{ model: DatesIn },
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
				],
				attributes: { exclude: ["createdAt", "updatedAt"] },
				order: [["dueDate", "ASC"]],
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt", "roomClassId"] },
	});

	// let newdata = data.map((item, index, arrayColl) => {

	//   arrayColl['book_date'] = item.Reservations
	//   return ;
	//   return {...item, book_date: { checkIn : item.Reservations.checkIn, checkOut : item.Reservations.checkOut }}
	// })

	res.status(200).json({ message: "ok", data });
});
const getAllOccupiedRooms = asyncWrapper(async (req, res) => {
	let data = await Room.findAll({
		include: [
			{ model: RoomClass, attributes: { exclude: ["createdAt", "updatedAt"] } },
			{
				model: Reservation,
				include: [
					{
						model: DatesIn,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
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
				],
				attributes: { exclude: ["createdAt", "updatedAt"] },
				order: [["dueDate", "ASC"]],
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt", "roomClassId"] },
	});

	// Filter out the occupied rooms
	const occupiedRooms = data.map((room) => {
		return Object.keys(isRoomOccupied(room)).length !== 0
			? isRoomOccupied(room)
			: null;
	});
	const newRooms = occupiedRooms.filter((room) => room !== null);

	res.status(200).json({ message: "ok", data: newRooms });
});

const getRoom = asyncWrapper(async (req, res) => {
	if (!req.params.id) {
		return res.status(404).json({ status: "error", message: "Id is required" });
	}

	if (isNaN(req.params.id)) {
		return res.status(400).json({ status: "error", message: "Invalid id" });
	}

	if (!req.params.id) return res.status(400).json({ message: "bad request" });

	const data = await Room.findByPk(req.params.id, {
		attributes: { exclude: ["createdAt", "updatedAt", "roomClassId"] },
		include: [
			{
				model: Reservation,
				attributes: ["checkIn", "checkOut"],
				order: [["dueDate", "ASC"]],
				where: {},
				onAfterFind: (tasks, options) => {},
			},
		],
	});
	if (!data) {
		return res
			.status(204)
			.json({ message: `Room class with id does not exist`, data });
	}
	res.status(200).json({ message: "ok", data });
});

const createRoom = asyncWrapper(async (req, res) => {
	if (!req.body.name || !req.body.roomClassId) {
		return res
			.status(400)
			.json({ message: "Please provide all required information" });
	}

	if (await Room.findOne({ where: { name: req.body.name } })) {
		return res.status(409).json({
			status: `error`,
			message: `Room ${req.body.name} already  exists`,
		});
	}

	const roomClass = await RoomClass.findByPk(req.body.roomClassId);
	if (!roomClass) {
		return res.status(400).json({ message: "Room class does not exist" });
	}

	req.body["status"] = "active";

	const data = await Room.create(req.body);
	return res.status(201).json({ message: "ok", data });
});

const deleteRoom = asyncWrapper(async (req, res) => {
	if (!req.params.id)
		return res.status(400).json({ status: "error", message: "bad request" });

	const room = await Room.findByPk(req.params.id);

	if (!room)
		return res
			.status(400)
			.json({ status: "error", message: "Room does not exist" });

	await room.destroy();
	return res
		.status(200)
		.json({ status: "ok", message: "Room deleted successfully" });
});

const updateRoom = asyncWrapper(async (req, res) => {
	if (!req.body.id)
		return res.status(400).json({ status: "error", message: "bad request" });

	const room = await Room.findByPk(req.body.id);

	if (!room)
		return res
			.status(400)
			.json({ status: "error", message: "Room does not exist" });

	room.set(req.body);
	await room.save();

	return res
		.status(200)
		.json({ status: "ok", message: "Room updated successfully" });
});

const getRoomsInRoomClass = asyncWrapper(async (req, res) => {
	let allData = [];
	const roomClasses = await RoomClass.findAll();

	for (let i = 0; i < roomClasses.length; i++) {
		let rooms = await Room.findAll({ where: { roomClassId: roomClasses[i] } });
		allData = [...allData, ...rooms];
	}

	res.status(200).json({
		message: "success",
		data: allData,
	});
});

const updateRoomStatus = asyncWrapper(async (req, res) => {
	const { roomId, status } = req.body;
	const room = await RoomfindOne({ where: { id: roomId } });

	if (!room) {
		return res.status(400).json({
			status: "failed",
			message: "reservation not found",
		});
	}

	await Room.update({ status }, { where: { id: roomId } });
	const updatedRoom = await Room.findOne({ where: { id: roomId } });
	return res.status(200).json({
		status: "success",
		message: "Room status update successfuly",
		data: updatedRoom,
	});
});

export default {
	getAllRoom,
	getRoom,
	createRoom,
	updateRoom,
	updateRoomStatus,
	deleteRoom,
	getAllOccupiedRooms,
	getRoomsInRoomClass,
};
