"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class CompanyRoom extends Model {
		static associate(models) {
			// Define associations here if needed in the future
		}
	}
	CompanyRoom.init(
		{
			// Using an auto-incrementing primary key
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			roomId: DataTypes.INTEGER,
			componyReservationId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "CompanyRoom",
			tableName: "CompanyRooms", // Make sure this matches your actual table name
		}
	);
	return CompanyRoom;
};
