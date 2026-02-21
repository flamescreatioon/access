'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Create Notifications table
        await queryInterface.createTable('Notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            body: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM('booking', 'membership', 'access', 'system'),
                defaultValue: 'system'
            },
            read: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            data: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            channel: {
                type: Sequelize.STRING,
                defaultValue: 'in_app'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 2. Add fields to Memberships (optional but helpful for Phase 3 UI)
        await queryInterface.addColumn('Memberships', 'auto_renew', {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        });
        await queryInterface.addColumn('Memberships', 'payment_method', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Notifications');
        await queryInterface.removeColumn('Memberships', 'auto_renew');
        await queryInterface.removeColumn('Memberships', 'payment_method');
    }
};
