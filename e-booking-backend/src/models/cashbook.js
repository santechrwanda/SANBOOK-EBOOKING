"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class CashFlow extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.User, { foreignKey: "doneBy" });
		}
	}
	CashFlow.init(
		{
			prevBalance: DataTypes.FLOAT,
			newBalance: DataTypes.FLOAT,
			date: DataTypes.DATEONLY,
			description: DataTypes.STRING,
			amount: DataTypes.FLOAT,
			accountType: DataTypes.ENUM("DEBIT", "CREDIT"),
			accountId: DataTypes.INTEGER,
			doneBy: DataTypes.INTEGER,
			doneTo: DataTypes.STRING,
			status: DataTypes.STRING,
			date: DataTypes.DATE,
			transactionId: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "CashFlow",
		}
	);
	return CashFlow;
};
