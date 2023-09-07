const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class ReservationRoom extends Model {
		static associate(models) {
			// No need to define any associations here for this specific model
		}
	}

	ReservationRoom.init(
		{
			reservationId: DataTypes.INTEGER,
			roomId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "ReservationRoom",
			tableName: "ReservationRoom", // Replace with the actual table name for the intermediate model
		}
	);

	return ReservationRoom;
};
