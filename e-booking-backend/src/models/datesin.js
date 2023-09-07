"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class DatesIn extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.Reservation, { foreignKey: "reservationId" });
			this.belongsTo(models.CompanyReservationDetail, {
				foreignKey: "companyReservationDetailId",
			});
		}
	}
	DatesIn.init(
		{
			datesIn: DataTypes.ARRAY(DataTypes.DATE),
			date: DataTypes.DATE,
			companyReservationDetailId: DataTypes.INTEGER,
			reservationId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "DatesIn",
			tableName: "DatesIns",
		}
	);
	return DatesIn;
};
