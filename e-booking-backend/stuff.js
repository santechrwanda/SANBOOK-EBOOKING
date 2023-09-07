"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Add new columns
		await queryInterface.addColumn(
			"Customers",
			"freightDetails",
			Sequelize.JSONB
		);
		await queryInterface.addColumn(
			"Customers",
			"creditCardDetails",
			Sequelize.JSONB
		);
	},

	down: async (queryInterface, Sequelize) => {
		// Remove new columns
		await queryInterface.removeColumn("Customers", "freightDetails");
		await queryInterface.removeColumn("Customers", "creditCardDetails");
	},
};
