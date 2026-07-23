"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename table RestaurantServices to RestaurateurServices (if it exists)
    const tableNames = await queryInterface.showAllTables();
    if (tableNames.includes("RestaurantServices")) {
      await queryInterface.renameTable(
        "RestaurantServices",
        "RestaurateurServices",
      );
    }

    // Rename column restaurateurId to restaurateurId in AppointmentModels if it exists
    const tableDesc = await queryInterface.describeTable("AppointmentModels");
    if (tableDesc.restaurateurId) {
      await queryInterface.renameColumn(
        "AppointmentModels",
        "restaurateurId",
        "restaurateurId",
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // revert column and table rename
    const tableDesc = await queryInterface.describeTable("AppointmentModels");
    if (tableDesc.restaurateurId) {
      await queryInterface.renameColumn(
        "AppointmentModels",
        "restaurateurId",
        "restaurateurId",
      );
    }

    const tableNames = await queryInterface.showAllTables();
    if (tableNames.includes("RestaurateurServices")) {
      await queryInterface.renameTable(
        "RestaurateurServices",
        "RestaurantServices",
      );
    }
  },
};
