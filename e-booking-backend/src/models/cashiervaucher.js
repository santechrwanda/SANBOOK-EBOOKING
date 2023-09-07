"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class CashierVaucher extends Model {
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
	CashierVaucher.init(
		{
			date: DataTypes.DATEONLY,
			description: DataTypes.STRING,
			amount: DataTypes.FLOAT,
			accountType: DataTypes.ENUM("DEBIT", "CREDIT"),
			account: DataTypes.STRING,
			doneBy: DataTypes.INTEGER,
			doneTo: DataTypes.STRING,
			status: DataTypes.STRING,
			vaucherId: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "CashierVaucher",
		}
	);
	return CashierVaucher;
};
