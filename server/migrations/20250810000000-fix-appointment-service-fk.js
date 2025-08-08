'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing foreign key constraint
    await queryInterface.removeConstraint('AppointmentModels', 'AppointmentModels_serviceId_fkey');

    // Add new foreign key constraint to BarberServices
    await queryInterface.addConstraint('AppointmentModels', {
      fields: ['serviceId'],
      type: 'foreign key',
      name: 'AppointmentModels_serviceId_BarberService_fkey',
      references: {
        table: 'BarberServices',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the new foreign key constraint
    await queryInterface.removeConstraint(
      'AppointmentModels',
      'AppointmentModels_serviceId_BarberService_fkey'
    );

    // Add back the original foreign key constraint
    await queryInterface.addConstraint('AppointmentModels', {
      fields: ['serviceId'],
      type: 'foreign key',
      name: 'AppointmentModels_serviceId_fkey',
      references: {
        table: 'ServiceModels',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
