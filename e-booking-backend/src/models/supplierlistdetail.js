"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class SupplierListDetail extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.SupplierList, { foreignKey: "supplierListId" });
			this.belongsTo(models.Store, { foreignKey: "storeId" });
			this.belongsTo(models.StockItemNew, { foreignKey: "stockValueItemId" });
		}
	}
	SupplierListDetail.init(
		{
			stockValueItemId: DataTypes.INTEGER,
			quantity: DataTypes.FLOAT,
			price: DataTypes.FLOAT,
			unit: DataTypes.STRING,
			storeId: DataTypes.INTEGER,
			supplierListId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "SupplierListDetail",
		}
	);
	return SupplierListDetail;
};
