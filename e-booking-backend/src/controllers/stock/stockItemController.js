import {
	StockItemNew,
	StockItemValue,
	StockItemTransaction,
	Store,
} from "../../models";
import { Op } from "sequelize";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";

const CreateItem = asyncWrapper(async (req, res) => {
	const name = req.body.name;
	const storeId = req.body.storeId;
	if (!storeId) {
		return res
			.status(400)
			.json({ status: "success", message: "storeId is required" });
	}

	if (!req.body.name)
		return res.status(400).json({ message: "Name is required" });

	if (await StockItemNew.findOne({ where: { name } })) {
		return res
			.status(409)
			.json({ status: "error", message: `${name} is already saved` });
	}

	const store = await Store.findByPk(storeId);
	if (!store) {
		return res
			.status(404)
			.json({ status: "error", message: " Store Not found" });
	}

	const stock_item = await StockItemNew.create(req.body);
	return res
		.status(201)
		.json({ status: `ok`, message: "Item created", data: stock_item });
});

const GetItem = asyncWrapper(async (req, res) => {
	if (!req.params.id)
		return res.status(400).json({
			status: `error`,
			message: "Item Id required and should be a number ",
		});
	const item = await StockItemNew.findByPk(req.params.id);
	if (!item) {
		return res.status(404).json({ status: "error", message: "Item not found" });
	}
	return res.status(200).json({ status: "success", data: item });
});

const GetItems = asyncWrapper(async (req, res) => {
	const items = await StockItemNew.findAll({
		include: [
			{
				model: StockItemValue,
				attributes: { exclude: ["createdAt", "updatedAt", "stockItemId"] },
			},
		],
		order: [["id", "DESC"]],
	});
	return res.status(200).json({ status: "ok", data: items });
});

const UpdateItem = asyncWrapper(async (req, res) => {
	if (!req.body.id) return res.status(400).json({ message: "id is required " });

	const stock_item = await StockItemNew.findByPk(req.body.id);

	if (!stock_item)
		return res.status(404).json({ message: "stock item not found " });

	stock_item.set(req.body);
	stock_item.save();

	return res.status(200).json({
		status: `ok`,
		message: " Stock Item updated successfully",
		data: stock_item,
	});
});

const returnItems = asyncWrapper(async (req, res) => {
	if (!req.body?.data) {
		return res.status(400).json({
			status: "error",
			message:
				"the request should be a JSON object and have properly named data",
		});
	}
	const { data } = req.body;

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
			balance:
				Number(itemValue ? itemValue.quantity : 0) + Number(element.quantity),
			status: "RETURNED",
		});
	}

	return res
		.status(201)
		.json({ status: "ok", message: "Items returned successfuly" });
});

const DeleteItem = asyncWrapper(async (req, res) => {
	if (!req.params.id)
		return res.status(400).json({ message: "id is required " });
	const stock_item = await StockItemNew.findByPk(req.params.id);
	if (!stock_item) return res.status(404).json({ message: " Item not found" });
	await stock_item.destroy();
	return res
		.status(200)
		.json({ status: `ok`, message: " Item deleted successfully" });
});

const stockBalance = asyncWrapper(async (req, res) => {
	const data = await StockItemValue.findAll({
		include: [
			{
				model: StockItemNew,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt", "stockItemId"] },
	});

	return res
		.status(200)
		.json({ status: "success", message: "stock balance", data });
});
const updateItemValue = asyncWrapper(async (req, res) => {
	const { id, quantity, price } = req.body;
	if (!id || !quantity || !price) {
		return res.status(404).json({
			status: `error`,
			message: " Id, quantity and price are all required  ",
		});
	}
	const stockItem = await StockItemValue.findOne({
		where: {
			id,
		},
		include: [
			{
				model: StockItemNew,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
	});

	if (!stockItem) {
		return res.status(404).json({
			status: `error`,
			message: "Item not found ",
		});
	}
	await StockItemTransaction.create({
		stockItem: stockItem.id,
		stockItemValue:'',
		preQuantity: stockItem.quantity ? stockItem.quantity : 0,
		newQuantity: quantity,
		date: new Date(),
		price: Number(price),
		balance: quantity,
		status: "QUANTITY UPDATE",
	});

	await StockItemValue.update({ quantity, price }, { where: { id } });

	const newItem = await StockItemValue.findOne({
		where: {
			id,
		},
		include: [
			{
				model: StockItemNew,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
	});
	return res
		.status(200)
		.json({ status: "success", message: "Item updated", data: newItem });
});

const setStockToZero = asyncWrapper(async (req, res) => {
	const data = await StockItemValue.findAll({
		include: [
			{
				model: StockItemNew,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt", "stockItemId"] },
	});

	for (let i = 0; i < data.length; i++) {
		await StockItemValue.update({ quantity: 0 }, { where: { id: data[i].id } });
	}
	const newData = await StockItemValue.findAll({
		include: [
			{
				model: StockItemNew,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt", "stockItemId"] },
	});
	return res
		.status(200)
		.json({ status: "success", message: "stock balance", data: newData });
});
const trackItemTransaction = asyncWrapper(async (req, res) => {
	const { item, itemValue, date_from, date_to } = req.query;
	console.log("stuff", req.query);
	if (item) {
		const row = await StockItemNew.findByPk(item);

		if (!row)
			return res
				.status(404)
				.json({ status: "error", message: "stock item not found" });
	}

	let itemTransaction;

	if (item && date_from && date_to) {
		itemTransaction = await StockItemTransaction.findAll({
			where: {
				stockItem: item,
				createdAt: {
					[Op.between]: [date_from, date_to],
				},
			},
			include: { model: StockItemValue },
		});
	} else if (date_from && date_to) {
		itemTransaction = await StockItemTransaction.findAll({
			where: {
				createdAt: {
					[Op.between]: [date_from, date_to],
				},
			},
		});
	} else if (item) {
		itemTransaction = await StockItemTransaction.findAll({
			where: {
				stockItem: item,
			},
		});
	} else {
		itemTransaction = await StockItemTransaction.findAll({
			include: [
				{ model: StockItemNew, attributes: { exclude: ["updatedAt"] } },
			],
		});
	}

	console.log("this is item", itemTransaction);
	itemTransaction = itemTransaction.map((item) => {
		let StockItemValues = item.StockItemNew.StockItemValues
			? item.StockItemNew.StockItemValues.filter((el) => {
					return el.id === itemValue ? true : false;
			  })
			: [];
		return {
			...item,
			StockItemNew: { ...item.StockItemNew, StockItemValues: StockItemValues },
		};
	});

	return res.status(200).json({ status: "success", data: itemTransaction });
});

const moveItemsToBeverage = asyncWrapper(async (req, res) => {
	const all = await StockItemNew.findAll({ where: { storeId: 1 } });

	for (let i = 0; i < all.length; i++) {
		await StockItemNew.update({ storeId: 2 }, { where: { id: all[i].id } });
	}
	const newData = await StockItemValue.findAll({
		include: [
			{
				model: StockItemNew,
				attributes: { exclude: ["createdAt", "updatedAt"] },
			},
		],
		attributes: { exclude: ["createdAt", "updatedAt", "stockItemId"] },
	});
	return res
		.status(200)
		.json({ status: "success", message: "items moved", data: newData });
});

const deleteTransactions = asyncWrapper(async (req, res) => {
	await StockItemTransaction.drop();

	res.status(200).json({
		status: "Success",
		message: "Destroyed 🔥🔥🔥🔥",
	});
});

export default {
	CreateItem,
	GetItem,
	GetItems,
	UpdateItem,
	DeleteItem,
	stockBalance,
	setStockToZero,
	trackItemTransaction,
	deleteTransactions,
	moveItemsToBeverage,
	returnItems,
};
