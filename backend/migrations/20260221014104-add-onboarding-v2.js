'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Update Users table
    await queryInterface.addColumn('Users', 'account_status', {
      type: Sequelize.STRING,
      defaultValue: 'INVITED',
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'onboarding_status', {
      type: Sequelize.STRING,
      defaultValue: 'NOT_STARTED',
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'activation_status', {
      type: Sequelize.STRING,
      defaultValue: 'INACTIVE',
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'first_login_required', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'profile_complete', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Update Memberships table
    await queryInterface.addColumn('Memberships', 'payment_status', {
      type: Sequelize.STRING,
      defaultValue: 'UNPAID',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'account_status');
    await queryInterface.removeColumn('Users', 'onboarding_status');
    await queryInterface.removeColumn('Users', 'activation_status');
    await queryInterface.removeColumn('Users', 'first_login_required');
    await queryInterface.removeColumn('Users', 'profile_complete');
    await queryInterface.removeColumn('Users', 'phone');
    await queryInterface.removeColumn('Memberships', 'payment_status');
  }
};
