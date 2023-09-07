"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("StockItemTransactions", "stockItemValue", {
			type: Sequelize.INTEGER,
			allowNull: true, // Set this to false if the column should not allow null values
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn(
			"StockItemTransactions",
			"stockItemValue"
		);
	},
};
