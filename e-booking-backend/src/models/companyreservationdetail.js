"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class CompanyReservationDetail extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here

			this.belongsTo(models.CompanyReservation, {
				foreignKey: "companyReservationId",
			});
			this.belongsTo(models.Room, { foreignKey: "roomId" });
			this.hasOne(models.Room, { foreignKey: "roomId" });
			this.hasMany(models.DatesIn, {
				foreignKey: "companyReservationDetailId",
			});
		}
	}
	CompanyReservationDetail.init(
		{
			hallId: DataTypes.INTEGER,
			roomId: DataTypes.INTEGER,
			companyReservationId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "CompanyReservationDetail",
			tableName: "CompanyReservationDetails",
		}
	);
	return CompanyReservationDetail;
};
