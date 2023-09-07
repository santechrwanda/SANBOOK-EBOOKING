"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class CompanyReservation extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.User, { foreignKey: "userId" });
			this.hasMany(models.CompanyReservationDetail, {
				foreignKey: "companyReservationId",
			});
		}
	}
	CompanyReservation.init(
		{
			checkIn: DataTypes.DATE,
			checkOut: DataTypes.DATE,
			customerId: DataTypes.INTEGER,
			details: DataTypes.JSONB,
			userId: DataTypes.INTEGER,
			amount: DataTypes.JSONB,
			payment: DataTypes.JSONB,
			booking_date: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			payment_status: DataTypes.STRING,
			status: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "CompanyReservation",
			tableName: "CompanyReservations",
		}
	);
	return CompanyReservation;
};
