import {
	StockPurchaseOrder,
	StockItemNew,
	StockItemValue,
	StockReceiveVoucher,
	StockPurchaseOrderDetail,
	StockReceiveVoucherDetail,
	StockItemTransaction,
} from "../../models";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generateId from "../../utils/generateChonologicId";

const create = asyncWrapper(async (req, res) => {
	if (!req.body?.data) {
		return res.status(400).json({
			status: "error",
			message:
				"the request should be a JSON object and have property named data",
		});
	}
	let total = req.body.data.reduce((acc, curr) => {
		return acc + Number(curr.price * curr.quantity);
	}, 0);

	const { data } = req.body;
	const stockPurchaseOrderId = data[0].stockPurchaseOrderId;
	const user = req.user;

	const reveiveVoucher = await StockReceiveVoucher.create({
		date: new Date(),
		userId: user.id,
		stockPurchaseOrderId: stockPurchaseOrderId,
		receiveVOucherID: `RV_${await generateId(StockPurchaseOrder)}`,
		total,
	});

	if (reveiveVoucher) {
		for (let element of data) {
			let itemValue = await StockItemValue.findOne({
				where: { price: element.price, stockItemId: element.item_id },
			});

			if (!itemValue) {
				itemValue = await StockItemValue.create({
					quantity: Number(element.quantity),
					price: Number(element.price),
					stockItemId: element.item_id,
				});
			} else {
				itemValue.set({
					quantity: Number(itemValue.quantity + element.quantity),
				});
				await itemValue.save();
			}

			await StockItemTransaction.create({
				stockItem: itemValue.stockItemId,
				stockItemValue: itemValue.id,
				preQuantity: itemValue ? itemValue.quantity : 0,
				newQuantity: element.quantity,
				date: new Date(),
				price: Number(element.price),
				balance: Number(itemValue.quantity),
				status: "ADDED",
			});

			let stockDetail = await StockReceiveVoucherDetail.create({
				stockItemId: element.item_id,
				stockReceiveVoucherId: reveiveVoucher.id,
				receivedQuantity: Number(element.quantity),
				unitPrice: Number(element.price),
			});
		}
	}

	return res
		.status(201)
		.json({ status: "ok", message: "Successifully Receive Voucher added " });
});

const index = asyncWrapper(async (req, res) => {
	const data = await StockReceiveVoucher.findAll({
		include: [
			{
				model: StockPurchaseOrder,
				order: [["createdAt", "DESC"]],
				attributes: { exclude: ["createdAt", "updatedAt"] },
				include: [
					{
						model: StockPurchaseOrderDetail,
						order: [["createdAt", "DESC"]],
						attributes: { exclude: ["createdAt", "updatedAt"] },
						include: [
							{
								model: StockItemNew,
								order: [["createdAt", "DESC"]],
								attributes: { exclude: ["createdAt", "updatedAt"] },
							},
						],
					},
				],
			},
			{
				model: StockReceiveVoucherDetail,
				include: [
					{
						model: StockItemNew,
						order: [["id", "DESC"]],
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"updatedAt",
						"stockPurchaseOrderId",
						"stockReceiveVoucherId",
						"stockItemId",
					],
				},
			},
		],
		attributes: { exclude: ["stockPurchaseOrderId", "createdAt", "updatedAt"] },
	});

	return res.status(200).json({ status: "success", data });
});

const updateReceiveVaucher = asyncWrapper(async (req, res) => {
	if (!req.body || !req.body.vaucherId || !req.body.details) {
		return res.status(400).json({
			status: "error",
			message:
				"the request should be a JSON object and have property named data",
		});
	}

	let missing = false;

	console.log("details", req.body.details);
	for (const element of req.body.details) {
		let { id, receivedQuantity, unitPrice } = element;
		if (!id) {
			const item = await StockReceiveVoucherDetail.findOne({ where: { id } });
			if (!item) {
				missing = true;
			}
		} else {
			await StockReceiveVoucherDetail.update(
				{ receivedQuantity, unitPrice },
				{ where: { id } }
			);
		}
	}
	if (missing) {
		return res.status(400).json({
			status: "failed",
		});
	} else {
		await StockReceiveVoucher.update(
			{ total: req.body.total },
			{ where: { id: req.body.vaucherId } }
		);
		const vaucher = await StockReceiveVoucher.findOne({
			where: { id: req.body.vaucherId },
		});
		return res.status(200).json({
			status: "success",
			message: "vaucher details updated !!!!",
			data: vaucher,
		});
	}
});

const destroy = asyncWrapper(async (req, res) => {
	if (!req.params?.id) {
		return res.status(400).json({ status: "error", message: "Id is required" });
	}
	const row = await StockReceiveVoucher.findByPk(req.params.id);

	if (!row) {
		return res
			.status(404)
			.json({ status: "error", message: " Voucher not found" });
	}

	await row.destroy();

	return res
		.status(200)
		.json({ status: "success", message: "Voucher deleted successfully" });
});

const trackItemTransaction = asyncWrapper(async (req, res) => {
	const { stockItemId } = req.params;
	if (!stockItemId) {
		return res
			.status(400)
			.json({ status: "error", message: "Stock Item is required" });
	}
	const stockItem = await StockItemNew.findByPk(stockItemId);

	if (!stockItem) {
		return res
			.status(404)
			.json({ status: "error", message: "No Stock Item found" });
	}
	const itemTrack = await StockPurchaseOrder.findAll({
		include: [
			{
				model: StockPurchaseOrderDetail,
				where: { stockItemId: stockItem },
				include: [
					{
						model: StockItemNew,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
				attributes: {
					exclude: ["stockPurchaseOrderId", "createdAt", "updatedAt"],
				},
			},
		],
		order: [["date", "DESC"]],
	});
});

const deleteAll = asyncWrapper(async (req, res) => {
	const all = await StockReceiveVoucher.findAll();

	for (let i = 0; i < all.length; i++) {
		all[i].destroy({ truncate: true });
	}
	return res.status(200).json({
		status: "success",
		message: "deleted ",
	});
});
export default {
	create,
	index,
	destroy,
	trackItemTransaction,
	updateReceiveVaucher,
	deleteAll,
};
