"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Room extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Room.belongsTo(models.RoomClass, { foreignKey: "roomClassId" });
			Room.hasMany(models.Reservation, { foreignKey: "roomId" });
			Room.belongsToMany(models.CompanyReservation, {
				through: models.CompanyRoom,
			});
			Room.hasMany(models.CompanyReservationDetail, { foreignKey: "roomId" });
		}
	}
	Room.init(
		{
			name: DataTypes.STRING,
			description: DataTypes.STRING,
			status: DataTypes.STRING,
			roomClassId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "Room",
			tableName: "Rooms",
		}
	);
	return Room;
};
