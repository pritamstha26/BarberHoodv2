"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename table BarberServices to RestaurateurServices (if it exists)
    const tableNames = await queryInterface.showAllTables();
    if (tableNames.includes("BarberServices")) {
      await queryInterface.renameTable(
        "BarberServices",
        "RestaurateurServices",
      );
    }

    // Rename column barberId to restaurateurId in AppointmentModels if it exists
    const tableDesc = await queryInterface.describeTable("AppointmentModels");
    if (tableDesc.barberId) {
      await queryInterface.renameColumn(
        "AppointmentModels",
        "barberId",
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
        "barberId",
      );
    }

    const tableNames = await queryInterface.showAllTables();
    if (tableNames.includes("RestaurateurServices")) {
      await queryInterface.renameTable(
        "RestaurateurServices",
        "BarberServices",
      );
    }
  },
};
