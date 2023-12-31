"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class PosbondecommandeDetail extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.PetitStockSale, {
				foreignKey: "petitStockSaleId",
			});
			this.belongsTo(models.Product, {
				foreignKey: "productId",
			});

			this.belongsTo(models.ProductPackage, {
				foreignKey: "packageId",
			});
			this.belongsTo(models.User, {
				foreignKey: "userId",
			});
			this.belongsTo(models.Posbondecommande, {
				foreignKey: "posbondecommandeId",
			});
		}
	}
	PosbondecommandeDetail.init(
		{
			posbondecommandeId: DataTypes.INTEGER,
			packageId: DataTypes.INTEGER,
			productId: DataTypes.INTEGER,
			quantity: DataTypes.INTEGER,
			userId: DataTypes.INTEGER,
			date: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "PosbondecommandeDetail",
		}
	);
	return PosbondecommandeDetail;
};
