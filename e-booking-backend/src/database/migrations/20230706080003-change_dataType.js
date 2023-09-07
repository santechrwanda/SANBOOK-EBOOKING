"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.changeColumn(
				"StockPurchaseOrderDetails",
				"currentQuantity",
				{
					type: Sequelize.FLOAT,
					allowNull: false,
				}
			),
			queryInterface.changeColumn(
				"StockPurchaseOrderDetails",
				"requestQuantity",
				{
					type: Sequelize.FLOAT,
					allowNull: false,
				}
			),
			queryInterface.changeColumn("StockPurchaseOrderDetails", "unitPrice", {
				type: Sequelize.FLOAT,
				allowNull: false,
			}),
			// Add more changeColumn statements for additional columns
		]);
	},

	async down(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.changeColumn(
				"StockPurchaseOrderDetails",
				"currentQuantity",
				{
					type: Sequelize.INTEGER,
					allowNull: false,
				}
			),
			queryInterface.changeColumn(
				"StockPurchaseOrderDetails",
				"requestQuantity",
				{
					type: Sequelize.INTEGER,
					allowNull: false,
				}
			),
			queryInterface.changeColumn("StockPurchaseOrderDetails", "unitPrice", {
				type: Sequelize.INTEGER,
				allowNull: false,
			}),
		]);
	},
};
