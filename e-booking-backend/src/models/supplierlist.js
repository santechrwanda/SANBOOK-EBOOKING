"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class SupplierList extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.Supplier, { foreignKey: "supplierId" });
			this.hasMany(models.SupplierListDetail, { foreignKey: "supplierListId" });
			this.belongsTo(models.User, { foreignKey: "userId" });
		}
	}
	SupplierList.init(
		{
			date: DataTypes.DATE,
			total: DataTypes.FLOAT,
			supplierId: DataTypes.INTEGER,
			status: DataTypes.STRING,
			userId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "SupplierList",
		}
	);
	return SupplierList;
};
