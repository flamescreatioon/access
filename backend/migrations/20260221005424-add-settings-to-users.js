'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'settings', {
      type: Sequelize.JSONB,
      defaultValue: {
        notifications: {
          push: true,
          email: true,
          marketing: false
        },
        theme: 'dark'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'settings');
  }
};
