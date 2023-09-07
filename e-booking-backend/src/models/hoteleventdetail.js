"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class HotelEventDetail extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.HotelEvent, { foreignKey: "eventId" });
		}
	}
	HotelEventDetail.init(
		{
			name: DataTypes.STRING,
			date: DataTypes.DATE,
			comment: DataTypes.STRING,
			quantity: DataTypes.INTEGER,
			days: DataTypes.INTEGER,
			comment: DataTypes.STRING,
			price: DataTypes.FLOAT,
			eventId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "HotelEventDetail",
		}
	);
	return HotelEventDetail;
};
