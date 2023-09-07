import {
	Supplier,
	SupplierList,
	SupplierListDetail,
	StockItemNew,
	Store,
	StockItemValue,
	StockItemTransaction,
	User,
} from "../../models";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generateId from "../../utils/generateChonologicId";

const GetAllSuppliers = asyncWrapper(async (req, res) => {
	const data = await Supplier.findAll({
		include: [
			{
				model: SupplierList,
				include: [
					{
						model: SupplierListDetail,
						include: [
							{
								model: StockItemValue,
								include: [{ model: StockItemNew }],
								attributes: { exclude: ["createdAt", "updatedAt"] },
							},
							{ model: Store },
						],
					},
					{ model: User },
				],
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt"] },
	});

	return res.status(200).json({ status: "success", data });
});

const GetAllSupplierLists = asyncWrapper(async (req, res) => {
	const data = await SupplierList.findAll({
		include: [
			{
				model: SupplierListDetail,
				include: [
					{
						model: StockItemValue,
						include: [{ model: StockItemNew }],
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
					{ model: Store },
				],
			},
			{ model: User },
		],
		attributes: { exclude: ["createdAt", "updatedAt"] },
	});

	return res.status(200).json({
		status: "OK",
		message: "All Supplier lists",
		data: data,
	});
});
const GetSupplyListsBySupplier = asyncWrapper(async (req, res) => {
	const { supplierId } = req.body;
	const lists = await SupplierList.findAll({ where: { supplierId } });

	return res.status(200).json({
		status: "Success",
		data: lists,
	});
});
const createSupplier = asyncWrapper(async (req, res) => {
	const { name, tel } = req.body;

	if (!name) {
		return res
			.status(400)
			.json({ status: "error", message: "supplier name is  requried " });
	}

	const supplier = await Supplier.create({
		name,
		tel,
	});

	return res.status(201).json({
		status: "success",
		message: " Supplier created ",
		data: supplier,
	});
});

const receiveItemsFromSupplier = asyncWrapper(async (req, res) => {
	const { supplierId, total, details, date } = req.body;
	let supplyList;
	let found = false;

	if (!supplierId || !total || !details || !date) {
		return res.status(400).json({
			status: "failed",
			message: "supplierId, total, details and date are required",
		});
	} else {
		supplyList = await SupplierList.create({
			supplierId: supplierId,
			total: Math.round(Number(total)),
			date,
		});
	}
	if (details.length === 0) {
		return res
			.status(400)
			.json({ status: "failed", message: "details can not be an empty array" });
	}

	for (const element of details) {
		let { storeId, name, quantity, price, unit, item_id, itemValueId } =
			element;
		if (!storeId || !name || !quantity) {
			return res.status(400).json({
				status: "failed",
				message: "storeId, name and quantity are all required",
			});
		} else {
			quantity = Number(quantity);
			let itemWithName = await StockItemNew.findOne({ where: { name } });
			console.log("itemwithName", itemWithName);

			let itemValue = await StockItemValue.findOne({
				where: { price, stockItemId: itemWithName.id },
			});
			if (!itemValue) {
				itemValue = await StockItemValue.create({
					quantity: quantity,
					price: Number(price),
					stockItemId: itemWithName.id,
				});
			} else {
				found = true;
				itemValue.set({
					quantity: Number(itemValue.quantity + quantity),
				});
				await itemValue.save();
			}
			await SupplierListDetail.create({
				stockValueItemId: itemValueId,
				storeId,
				supplierListId: supplyList.id,
				quantity,
				unit,
				price,
			});

			await StockItemTransaction.create({
				stockItem: itemValue.stockItemId,
				preQuantity: found ? itemValue.quantity : 0,
				newQuantity: element.quantity,
				date: new Date(),
				price: Number(element.price),
				balance: Number(itemValue ? itemValue.quantity : 0 + quantity),
				status: "SUPPLIED",
			});
		}
	}

	const supplierList = await SupplierList.findOne({
		where: { id: supplyList.id },
	});
	return res.status(201).json({
		status: "success",
		message: "Items added to stock",
		data: supplierList,
	});
});

const deleteSupplyList = asyncWrapper(async (req, res) => {
	const { id } = req.body;
	if (!id) {
		return res.status(400).json({
			message: "Supply list id is required",
			status: "failed",
		});
	}

	const supplyList = await SupplierList.findByPk({
		id,
		include: [
			{
				model: SupplierListDetail,
				include: [
					{
						model: StockItemValue,
						include: [{ model: StockItemNew }],
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
					{ model: Store },
				],
			},
			{ model: User },
		],
	});

	const allSupplierListDetails = supplyList.SupplierListDetail;
	for (element of allSupplierListDetails) {
		const itemValue = await StockItemValue.findByPk({
			id: element.stockValueItemId,
		});
		itemValue.set({ quantity: Number(itemValue.quantity - element.quantity) });
		await itemValue.save();
	}
	await supplyList.destroy({ truncate: true });
	return res.status(200).json({
		message: "supply list deleted",
	});
});

const updateSupplyList = asyncWrapper(async (req, res) => {
	const { id, total, details, date } = req.body;
	if (!id) {
		return res.status(400).json({
			message: "Supply list id is required",
			status: "failed",
		});
	}
	const supplyList = await SupplierList.findByPk({
		id,
		include: [
			{
				model: SupplierListDetail,
				include: [
					{
						model: StockItemValue,
						include: [{ model: StockItemNew }],
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
					{ model: Store },
				],
			},
			{ model: User },
		],
	});

	if (!supplyList) {
		return res.status(400).json({
			status: "failed",
			message: "Supply list not found",
		});
	}

	for (const element of details) {
		const detail = await SupplierListDetail.find({
			where: { id: element.id, supplierListId: id },
		});

		if (detail) {
			await SupplierListDetail.update(
				{ quantity: element.quantity, price: price },
				{ where: { id: element.id, supplierListId: id } }
			);
			const itemValue = await StockItemValue.findByPk({
				id: element.stockValueItemId,
			});
			if (itemValue) {
				itemValue.set({
					quantity: Number(
						itemValue.quantity - detail.quantity + element.quantity
					),
				});
				await itemValue.save();
			}
		}
	}

	const newSupplyList = await SupplierList.findByPk({
		id,
		include: [
			{
				model: SupplierListDetail,
				include: [
					{
						model: StockItemValue,
						include: [{ model: StockItemNew }],
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
					{ model: Store },
				],
			},
			{ model: User },
		],
	});
	return res.status(203).json({
		status: "success",
		data: newSupplyList,
		message: "Supply list updated successfully",
	});
});

const deleteAllSuppliers = asyncWrapper(async (req, res) => {
	await SupplierListDetail.drop();
	await SupplierList.drop();
	await Supplier.drop();

	res.status(200).json({
		status: "success",
		message: "🔥🔥🔥🔥 Destroyed ",
	});
});
export default {
	createSupplier,
	GetAllSuppliers,
	GetAllSupplierLists,
	GetSupplyListsBySupplier,
	receiveItemsFromSupplier,
	deleteSupplyList,
	updateSupplyList,
	deleteAllSuppliers,
};
