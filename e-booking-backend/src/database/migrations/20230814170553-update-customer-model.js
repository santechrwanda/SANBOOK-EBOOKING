"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.renameColumn("Customers", "names", "surname");
		await queryInterface.addColumn("Customers", "givenname", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("Customers", "profession", Sequelize.STRING);
		await queryInterface.addColumn(
			"Customers",
			"date_of_issue",
			Sequelize.STRING
		);
		await queryInterface.addColumn("Customers", "other_note", Sequelize.STRING);
		await queryInterface.addColumn(
			"Customers",
			"place_of_birth",
			Sequelize.STRING
		);
		await queryInterface.addColumn(
			"Customers",
			"nationality",
			Sequelize.STRING
		);
		await queryInterface.addColumn("Customers", "residence", Sequelize.STRING);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.renameColumn("Customers", "surname", "names");
		await queryInterface.removeColumn("Customers", "givenname");
		await queryInterface.removeColumn("Customers", "profession");
		await queryInterface.removeColumn("Customers", "date_of_issue");
		await queryInterface.removeColumn("Customers", "other_note");
		await queryInterface.removeColumn("Customers", "place_of_birth");
		await queryInterface.removeColumn("Customers", "nationality");
		await queryInterface.removeColumn("Customers", "residence");
	},
};
