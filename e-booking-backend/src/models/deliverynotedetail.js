"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class DeliveryNoteDetail extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.DeliveryNote, { foreignKey: "deliveryId" });
		}
	}
	DeliveryNoteDetail.init(
		{
			description: DataTypes.STRING,
			quantity: DataTypes.INTEGER,
			times: DataTypes.INTEGER,
			unitPrice: DataTypes.FLOAT,
			date: DataTypes.DATE,
			deliveryId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "DeliveryNoteDetail",
		}
	);
	return DeliveryNoteDetail;
};
