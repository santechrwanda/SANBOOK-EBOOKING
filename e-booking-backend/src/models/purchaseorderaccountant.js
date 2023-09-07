"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class PurchaseOrderAccountant extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasMany(models.PurchaseOrderAccountantDetail, {
				foreignKey: "purchaseOrderAccountantId",
			});
			this.belongsTo(models.User, { foreignKey: "userId" });
		}
	}
	PurchaseOrderAccountant.init(
		{
			clientName: DataTypes.STRING,
			clientType: DataTypes.STRING,
			function: DataTypes.STRING,
			deliveryLink: DataTypes.INTEGER,
			status: DataTypes.STRING,
			total: DataTypes.FLOAT,
			vatTotal: DataTypes.FLOAT,
			pax: DataTypes.INTEGER,
			currency: DataTypes.STRING,
			POGenerated: DataTypes.STRING,
			userId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "PurchaseOrderAccountant",
			tableName: "PurchaseOrderAccountants",
		}
	);
	return PurchaseOrderAccountant;
};
