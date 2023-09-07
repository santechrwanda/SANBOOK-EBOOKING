"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class HotelEventSheet extends Model {
		static associate(models) {
			this.belongsTo(models.User, { foreignKey: "userId" });
			this.belongsTo(models.HotelEvent, { foreignKey: "hoteleventId" });
		}
	}
	HotelEventSheet.init(
		{
			hoteleventId: DataTypes.INTEGER,
			details: DataTypes.STRING,
			userId: DataTypes.INTEGER,
			date: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "HotelEventSheet",
		}
	);
	return HotelEventSheet;
};
