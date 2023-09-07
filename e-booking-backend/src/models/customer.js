"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Customer extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasMany(models.Reservation, { foreignKey: "customerId" });
		}
	}
	Customer.init(
		{
			surname: DataTypes.STRING,
			givenname: DataTypes.STRING,
			email: DataTypes.STRING,
			phone: DataTypes.STRING,
			profession: DataTypes.STRING,
			date_of_issue: DataTypes.STRING,
			other_note: DataTypes.STRING,
			place_of_birth: DataTypes.STRING,
			nationality: DataTypes.STRING,
			residence: DataTypes.STRING,
			identification: DataTypes.STRING,
			status: DataTypes.STRING,
			freightDetails: DataTypes.JSONB,
			creditCardDetails: DataTypes.JSONB,
			customerType: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Customer",
			tableName: "Customers",
		}
	);
	return Customer;
};
