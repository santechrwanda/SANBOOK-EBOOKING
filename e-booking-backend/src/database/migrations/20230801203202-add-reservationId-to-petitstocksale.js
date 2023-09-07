"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("PetitStockSales", "reservationId", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});

		await queryInterface.addColumn("PetitStockSales", "paymentMethod", {
			type: Sequelize.JSONB,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("PetitStockSales", "reservationId");
		await queryInterface.removeColumn("PetitStockSales", "paymentMethod");
	},
};
