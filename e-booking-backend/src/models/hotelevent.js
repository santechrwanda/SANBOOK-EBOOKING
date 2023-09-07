"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class HotelEvent extends Model {
		static associate(models) {
			this.hasMany(models.HotelEventDetail, { foreignKey: "eventId" });
			this.hasMany(models.HotelEventSheet, { foreignKey: "hoteleventId" });
			this.belongsTo(models.User, { foreignKey: "userId" });
			this.belongsTo(models.Hall, { foreignKey: "hallId" });
		}
	}
	HotelEvent.init(
		{
			customerName: DataTypes.STRING,
			eventName: DataTypes.STRING,
			telephone: DataTypes.STRING,
			price_per_day: DataTypes.INTEGER,
			pax: DataTypes.INTEGER,
			location: DataTypes.STRING,
			function: DataTypes.STRING,
			enventGenerated: DataTypes.STRING,
			status: DataTypes.STRING,
			startDate: DataTypes.DATE,
			endDate: DataTypes.DATE,
			hallId: DataTypes.INTEGER,
			userId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "HotelEvent",
		}
	);
	return HotelEvent;
};
