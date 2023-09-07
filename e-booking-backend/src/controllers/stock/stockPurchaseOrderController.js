import {
	StockPurchaseOrder,
	StockItemValue,
	StockPurchaseOrderDetail,
	StockReceiveVoucher,
	StockReceiveVoucherDetail,
	StockItemNew,
	User,
} from "../../models";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generateId from "../../utils/generateChonologicId";

const create = asyncWrapper(async (req, res) => {
	if (!req.body?.order || typeof req.body.order !== "object") {
		return res.status(400).json({
			status: "error",
			message: "Order Required and should be an Object",
		});
	}

	let total = req.body.order.reduce((acc, curr) => {
		return acc + curr.price * curr.quantity;
	}, 0);
	const user = req.user;

	const pOrder = await StockPurchaseOrder.create({
		date: new Date(),
		userId: user.id,
		status: "PENDING",
		purchaseOrderId: `PO_${await generateId(StockPurchaseOrder)}`,
		total,
	});

	if (pOrder) {
		for (let element of req.body.order) {
			let itemValue = await StockItemValue.findOne({
				where: { price: element.price, stockItemId: element.id },
			});

			let stockDetail = await StockPurchaseOrderDetail.create({
				stockItemId: element.id,
				stockPurchaseOrderId: pOrder.id,
				currentQuantity: itemValue ? itemValue.quantity : 0,
				requestQuantity: element.quantity,
				unitPrice: element.price,
				unit: element.unit,
			});
		}
	}

	return res
		.status(201)
		.json({ status: "ok", message: "Successifully Purchase Order added " });
});

const index = asyncWrapper(async (req, res) => {
	const data = await StockPurchaseOrder.findAll({
		include: [
			{
				model: StockPurchaseOrderDetail,
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"stockPurchaseOrderId",
						"stockItemId",
					],
				},
				include: [
					{
						model: StockItemNew,
						attributes: { exclude: ["createdAt", "updatedAt"] },
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
		attributes: { exclude: ["createdAt", "updatedAt"] },
	});

	return res
		.status(200)
		.json({ status: "ok", message: "Purchase order  retrieved", data });
});

const show = asyncWrapper(async (req, res) => {
	if (!req.params?.id || isNaN(req.params?.id))
		return res.status(400).json({ staus: "error", message: "Invalid id" });

	const row = await StockPurchaseOrder.findByPk(req.params.id, {
		include: [
			{
				model: StockPurchaseOrderDetail,
				attributes: { exclude: ["createdAt", "updatedAt"] },
				include: [
					{
						model: StockItemNew,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
			},
		],
	});

	return res
		.status(200)
		.json({ status: "success", message: "Successfull retrieval", data: data });
});

const update = asyncWrapper(async (req, res) => {
	if (!req.body?.id) {
		return res
			.status(400)
			.json({ status: "error", message: " Id is required " });
	}

	const data = await StockPurchaseOrder.findByPk(req.body.id);

	if (!data) {
		return res.status(404).json({
			status: "error",
			message: " Id related to a stock order is required not found",
		});
	}

	data.set(req.body);
	data.save();
	return res
		.status(200)
		.json({ status: "success", message: "Successfully Order updated" });
});

const destroy = asyncWrapper(async (req, res) => {
	if (!req.params?.id) {
		return res.status(400).json({ status: "error", message: "Id is required" });
	}
	const row = await StockPurchaseOrder.findByPk(req.params.id);
	if (!row) {
		return res
			.status(400)
			.json({ status: "error", message: "Order not found" });
	}
	await row.destroy();
	return res
		.status(200)
		.json({ status: "success", message: "Order successfully deleted" });
});

const getApproved = asyncWrapper(async (req, res) => {
	const data = await StockPurchaseOrder.findAll({
		include: [
			{
				model: StockPurchaseOrderDetail,
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"stockPurchaseOrderId",
						"stockItemId",
					],
				},
				include: [
					{
						model: StockItemNew,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt"] },
		where: { status: "APPROVED" },
	});

	return res
		.status(200)
		.json({ status: "ok", message: "Purchase order  retrieved", data });
});

const getNotApproved = asyncWrapper(async (req, res) => {
	const data = await StockPurchaseOrder.findAll({
		include: [
			{
				model: StockPurchaseOrderDetail,
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"stockPurchaseOrderId",
						"stockItemId",
					],
				},
				include: [
					{
						model: StockItemNew,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt"] },
		where: { status: "PENDING" },
	});

	return res
		.status(200)
		.json({ status: "ok", message: "Purchase order  retrieved", data });
});

const approve = asyncWrapper(async (req, res) => {
	if (!req.body?.orderId || !req.body?.data) {
		return res.status(400).json({
			status: "error",
			message: "Orders Id is required && data required ",
		});
	}

	const { data } = req.body;

	const order = await StockPurchaseOrder.findByPk(req.body.orderId, {
		include: [
			{
				model: StockPurchaseOrderDetail,
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"stockPurchaseOrderId",
						"stockItemId",
					],
				},
				include: [
					{
						model: StockItemNew,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt"] },
	});
	if (!order) {
		return res
			.status(404)
			.json({ status: "error", message: " Order not found" });
	}

	for (let element of data) {
		if (element.requestQuantity === 0) {
			const zeroElement = await StockPurchaseOrderDetail.findByPk(element.id);
			await zeroElement.destroy({ truncate: true });
		} else {
			await StockPurchaseOrderDetail.update(
				{
					requestQuantity: element.requestQuantity,
					unitPrice: element.unitPrice,
				},
				{ where: { id: element.id } }
			);
		}
	}

	await order.save();
	const newrequest = await StockPurchaseOrder.findByPk(order.id);

	if (order) {
		newrequest.set({ status: "APPROVED" });
		await newrequest.save();
	}

	return res.status(200).json({
		status: "success",
		message: "Successfully order approved",
		data: newrequest,
	});
});

const deleteAll = asyncWrapper(async (req, res) => {
	await StockPurchaseOrderDetail.drop();
	await StockReceiveVoucherDetail.drop();
	await stockreceivevoucher.drop();
	await StockPurchaseOrder.drop();
	res.status(200).json({ status: "success", message: "Destroyed 🔥🔥🔥" });
});

export default {
	create,
	index,
	show,
	update,
	destroy,
	getApproved,
	getNotApproved,
	approve,
	deleteAll,
};
