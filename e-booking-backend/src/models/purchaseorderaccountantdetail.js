"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class PurchaseOrderAccountantDetail extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.User, { foreignKey: "userId" });
		}
	}
	PurchaseOrderAccountantDetail.init(
		{
			name: DataTypes.STRING,
			quantity: DataTypes.INTEGER,
			price: DataTypes.FLOAT,
			times: DataTypes.INTEGER,
			VAT: DataTypes.STRING,
			date: DataTypes.DATE,
			purchaseOrderAccountantId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "PurchaseOrderAccountantDetail",
			tableName: "PurchaseOrderAccountantDetails",
		}
	);
	return PurchaseOrderAccountantDetail;
};
