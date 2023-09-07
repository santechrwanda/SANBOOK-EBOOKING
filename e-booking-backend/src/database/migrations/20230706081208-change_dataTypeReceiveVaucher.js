"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.changeColumn(
				"StockReceiveVoucherDetails",
				"receivedQuantity",
				{
					type: Sequelize.FLOAT,
					allowNull: false,
				}
			),

			// Add more changeColumn statements for additional columns
		]);
	},

	async down(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.changeColumn(
				"StockReceiveVoucherDetails",
				"receivedQuantity",
				{
					type: Sequelize.INTEGER,
					allowNull: false,
				}
			),

			// Add more changeColumn statements for additional columns
		]);
	},
};
