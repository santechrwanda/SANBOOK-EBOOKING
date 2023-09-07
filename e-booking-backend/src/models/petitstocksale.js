"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class PetitStockSale extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasMany(models.PetitStockSaleDetail, {
				foreignKey: "petitStockSaleId",
			});
			this.belongsTo(models.Reservation, { foreignKey: "reservationId" });
			this.belongsTo(models.PetitStock, { foreignKey: "petiStockId" });
			this.belongsTo(models.User, { foreignKey: "userId" });
		}
	}
	PetitStockSale.init(
		{
			date: DataTypes.DATE,
			petiStockId: DataTypes.INTEGER,
			userId: DataTypes.INTEGER,
			amount: DataTypes.FLOAT,
			reservationId: DataTypes.INTEGER,
			paymentMethod: DataTypes.JSONB,
			salesId: DataTypes.STRING,
			status: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "PetitStockSale",
		}
	);

	return PetitStockSale;
};
