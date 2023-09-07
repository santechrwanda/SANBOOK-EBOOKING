"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Invoiced extends Model {
		static associate(models) {
			this.hasMany(models.InvoiceDetail, { foreignKey: "invoiceId" });
			this.hasMany(models.InvoicePayment, { foreignKey: "invoiceId" });
			this.belongsTo(models.User, { foreignKey: "userId" });
		}
	}

	Invoiced.init(
		{
			clientName: DataTypes.STRING,
			clientType: DataTypes.STRING,
			function: DataTypes.STRING,
			deliveryLink: DataTypes.INTEGER,
			status: DataTypes.STRING,
			total: DataTypes.FLOAT,
			vatTotal: DataTypes.FLOAT,
			pax: DataTypes.INTEGER,
			currency: DataTypes.STRING,
			invoiceGenerated: DataTypes.STRING,
			userId: DataTypes.INTEGER,
			updateHistory: {
				type: DataTypes.JSONB,
				defaultValue: [],
			},
		},
		{
			sequelize,
			modelName: "Invoiced",
			timestamps: true,
		}
	);

	Invoiced.addHook("beforeUpdate", async (instance, options) => {
		const currentVersion = await Invoiced.findByPk(instance.id);

		const previousVersion = {
			clientName: currentVersion.clientName,
			clientType: currentVersion.clientType,
			function: currentVersion.function,
			deliveryLink: currentVersion.deliveryLink,
			status: currentVersion.status,
			total: currentVersion.total,
			vatTotal: currentVersion.vatTotal,
			pax: currentVersion.pax,
			invoiceGenerated: currentVersion.invoiceGenerated,
			userId: currentVersion.userId,
			updatedAt: currentVersion.updatedAt,
			createdAt: currentVersion.createdAt,
		};
		console.log("previus", previousVersion);

		const update = {
			previousVersion,
			updatedAt: new Date(),
		};

		instance.updateHistory.push(update);
	});

	return Invoiced;
};
