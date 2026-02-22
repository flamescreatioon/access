'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('AccessTiers', 'period', {
            type: Sequelize.ENUM('monthly', 'yearly', 'one-time'),
            defaultValue: 'yearly',
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('AccessTiers', 'period');
        // Note: Dropping the ENUM type itself might be needed depending on your DB dialect 
        // but for Postgres, it's often safer to just leave the type or use raw SQL to drop it.
    }
};
