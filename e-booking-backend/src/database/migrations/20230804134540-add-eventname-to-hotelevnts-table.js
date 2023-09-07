"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("HotelEvents", "eventName", {
			type: Sequelize.STRING,
			allowNull: true, // This adds the 'accept null close' property
			defaultValue: null, // If you want to set a default value, you can specify it here
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("HotelEvents", "eventName", {
			type: Sequelize.STRING,
			allowNull: false, // Revert the 'accept null close' property in the down method if needed
		});
	},
};
