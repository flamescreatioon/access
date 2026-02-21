'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'department', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('Users', 'level', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('Users', 'payment_status', {
            type: Sequelize.STRING,
            defaultValue: 'NOT_REQUESTED',
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'department');
        await queryInterface.removeColumn('Users', 'level');
        await queryInterface.removeColumn('Users', 'payment_status');
    }
};
