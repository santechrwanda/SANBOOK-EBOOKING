import { CashFlow, Account, User } from "../../models";
import { asyncWrapper } from "../../utils/handlingTryCatchBlocks";
import generateId from "../../utils/generateChonologicId";

const createAccount = asyncWrapper(async (req, res) => {
	const { type, name } = req.body;
	if (!type && !name) {
		res.status(401).json({
			status: "failed",
			message: "account name and type are required",
		});
	}
	const account = await Account.create({
		name: DataTypes.STRING,
		balance: 0,
		type,
	});

	res.status(201).json({
		status: "success",
		data: account,
	});
});

const getAllAccounts = asyncWrapper(async (req, res) => {
	const accounts = await Account.findAll({
		include: [{ model: CashFlow, include: [{ model: User }] }],
	});

	res.status(200).json({
		status: "success",
		data: accounts,
	});
});

const updateAccount = asyncWrapper(async (req, res) => {
	const { name, id } = req.body;

	await Account.update({ name }, { where: { id } });
	const account = await Account.findOne({ where: { id } });
	res.status(203).json({
		status: "updated",
		data: account,
	});
});

const debit = asyncWrapper(async (req, res) => {
	if (!req.body.amount) {
		return res
			.status(400)
			.json({ status: "error", message: "amount must be provided " });
	}
	if (!req.body.doneTo) {
		return res.status(400).json({
			status: "error",
			message: "The user who carries the money is required",
		});
	}

	if (!req.body.account) {
		return res
			.status(400)
			.json({ status: "error", message: "The account is required" });
	}

	const { account, accountId, amount, description, doneTo } = req.body;

	let accountInfo = await Account.findOne({ where: { name: account } });

	if (!accountInfo) {
		accountInfo = await Account.create({ name: account, balance: 0 });
	}

	const cash_flow = await CashFlow.create({
		prevBalance: accountInfo.balance,
		newBalance: Number(accountInfo.balance) + Number(amount),
		date: new Date(),
		description,
		amount,
		account: accounId,
		accountType: "DEBIT",
		doneBy: req.user.id,
		doneTo,
		status: "SUCCESS",
		transactionId: `TR_${await generateId(CashFlow)}`,
	});

	if (cash_flow) {
		accountInfo.set({ balance: cash_flow.newBalance });
	}
	await accountInfo.save();

	return res.status(200).json({
		status: "success",
		message: `Success ${amount} Debited on ${accountInfo.name} account `,
		balance: accountInfo,
	});
});

const credit = asyncWrapper(async (req, res) => {
	if (!req.body.amount) {
		return res
			.status(400)
			.json({ status: "error", message: "amount must be provided " });
	}
	if (!req.body.doneTo) {
		return res.status(400).json({
			status: "error",
			message: "The ID of who carries the money is required",
		});
	}

	if (!req.body.account) {
		return res
			.status(400)
			.json({ status: "error", message: "The account is required" });
	}

	const { accountId, account, amount, description, doneTo } = req.body;

	if (account && accountId) {
		return request.status(200).json({
			status: "error",
			message: "Both account and accountId can't be filled at once ",
		});
	}

	let accountInfo = await Account.findOne({ where: { name: account } });

	if (!accountInfo) {
		accountInfo = await Account.create({ name: "CASH", balance: 0 });
	}

	const cash_flow = await CashFlow.create({
		prevBalance: accountInfo.balance,
		newBalance: Number(accountInfo.balance) - Number(amount),
		date: new Date(),
		amount,
		account: accountId,
		description,
		accountType: "CREDIT",
		doneBy: req.user.id,
		doneTo,
		status: "SUCCESS",
		transactionId: `TR_${await generate(CashFlow)}`,
	});

	if (cash_flow) {
		accountInfo.set({ balance: Number(accountInfo.balance + amount) });
	}
	await accountInfo.save();

	return res.status(200).json({
		status: "success",
		message: `Success ${amount} Credited from ${accountInfo.name} account `,
		data: cash_flow,
		balance: accountInfo,
	});
});

const cashFlows = asyncWrapper(async (req, res) => {
	let accountInfo = await Account.findOne({ where: { name: "CASH" } });

	const data = await CashFlow.findAll();

	return res
		.status(200)
		.json({ status: "success", data, balance: accountInfo });
});

const setCashToZero = asyncWrapper(async (req, res) => {
	let accountInfo = await Account.findOne({ where: { name: "CASH" } });
	accountInfo.set({
		...accountInfo,
		balance: 0,
		prevBalance: 0,
		newBalance: 0,
	});
	await accountInfo.save();
	return res.status(200).json({
		status: "sucess",
		data: accountInfo,
		message: "set to zero !!!",
	});
});

const updateTransaction = asyncWrapper(async (req, res) => {
	if (!req.body.id) {
		return res.status(401).json({
			status: "failed",
			message: "provide the id the transaction",
		});
	}

	let transaction = await CashFlow.findByPk(req.body.id);
	if (!transaction) {
		return res.status(401).json({
			status: "failed",
			message: "record transaction not found",
		});
	}

	transaction.set({
		...transaction,
		amount: req.body.amount,
		doneTo: req.body.doneTo,
		description: req.body.description,
	});
	await transaction.save();
	const newTransactions = await CashFlow.findAll({
		include: [
			{
				model: User,
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
	});

	return res.status(200).json({
		status: "sucess",
		data: newTransactions,
		message: "transacation updated successfully",
	});
});

const deleteAll = asyncWrapper(async (req, res) => {
	await CashFlow.drop();
	return res.status(200).json({
		status: "sucess",
	});
});
export default {
	credit,
	debit,
	cashFlows,
	setCashToZero,
	updateTransaction,
	deleteAll,
};
