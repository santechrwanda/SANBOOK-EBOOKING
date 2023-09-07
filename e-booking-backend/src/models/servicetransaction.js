"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ServiceTransaction extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.User, { foreignKey: "userId" });
			this.belongsTo(models.Service, { foreignKey: "serviceId" });
			this.belongsTo(models.ServiceCategory, {
				foreignKey: "service_categoryId",
			});
			this.belongsTo(models.Reservation, { foreignKey: "reservationId" });
		}
	}
	ServiceTransaction.init(
		{
			client_name: DataTypes.STRING,
			serviceId: DataTypes.INTEGER,
			service_categoryId: { type: DataTypes.INTEGER },
			status: DataTypes.STRING,
			userId: DataTypes.INTEGER,
			total: DataTypes.FLOAT,
			reservationId: DataTypes.INTEGER,
			serviceSellId: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "ServiceTransaction",
		}
	);
	return ServiceTransaction;
};
