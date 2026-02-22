'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'is_inside', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn('Users', 'access_code', {
      type: Sequelize.STRING(6),
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'access_code_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'is_inside');
    await queryInterface.removeColumn('Users', 'access_code');
    await queryInterface.removeColumn('Users', 'access_code_expires');
  }
};
