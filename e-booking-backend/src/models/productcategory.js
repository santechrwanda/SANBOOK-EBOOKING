"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ProductCategory extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			ProductCategory.hasMany(models.Package, { foreignKey: "categoryId" });
		}
	}
	ProductCategory.init(
		{
			name: DataTypes.STRING,
			status: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "ProductCategory",
			tableName: "ProductCategories",
		}
	);
	return ProductCategory;
};
