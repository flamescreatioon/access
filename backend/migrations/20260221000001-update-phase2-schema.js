'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Create Equipments table
        await queryInterface.createTable('Equipments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT
            },
            status: {
                type: Sequelize.ENUM('available', 'in_use', 'maintenance'),
                defaultValue: 'available'
            },
            photo: {
                type: Sequelize.STRING
            },
            safety_guidelines: {
                type: Sequelize.TEXT
            },
            requires_certification: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            certification_name: {
                type: Sequelize.STRING
            },
            hourly_cost: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            max_session_hours: {
                type: Sequelize.INTEGER,
                defaultValue: 4,
            },
            daily_limit_hours: {
                type: Sequelize.INTEGER,
                defaultValue: 8,
            },
            min_tier_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            location: {
                type: Sequelize.STRING
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

        // 2. Create UserCertifications table
        await queryInterface.createTable('UserCertifications', {
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
            certification_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            certified_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            expires_at: {
                type: Sequelize.DATE
            },
            certified_by: {
                type: Sequelize.INTEGER
            },
            notes: {
                type: Sequelize.TEXT
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

        // 3. Add equipment_id to Bookings
        await queryInterface.addColumn('Bookings', 'equipment_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Equipments');
        await queryInterface.dropTable('UserCertifications');
        await queryInterface.removeColumn('Bookings', 'equipment_id');
    }
};
