"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ProductPackage extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	ProductPackage.init(
		{
			price: DataTypes.INTEGER,
			unit: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "ProductPackage",
			tableName: "ProductPackages",
			timestamps: false,
			getters: true, // Include getters to transform the data when retrieving from the database
			setters: false, // Exclude setters to transform the data when saving to the database
		}
	);

	return ProductPackage;
};
