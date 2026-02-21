'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Create Spaces table
        await queryInterface.createTable('Spaces', {
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
            description: {
                type: Sequelize.TEXT
            },
            type: {
                type: Sequelize.ENUM('meeting_room', 'coworking', 'studio', 'lab', 'event_space', 'private_office'),
                defaultValue: 'meeting_room',
            },
            capacity: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            amenities: {
                type: Sequelize.TEXT,
                defaultValue: '[]',
            },
            photos: {
                type: Sequelize.TEXT,
                defaultValue: '[]',
            },
            rules: {
                type: Sequelize.TEXT
            },
            min_tier_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            hourly_rate: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            max_booking_hours: {
                type: Sequelize.INTEGER,
                defaultValue: 4,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            location: {
                type: Sequelize.STRING
            },
            floor: {
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

        // 2. Add columns to Bookings
        await queryInterface.addColumn('Bookings', 'space_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
        await queryInterface.addColumn('Bookings', 'type', {
            type: Sequelize.ENUM('space', 'equipment'),
            defaultValue: 'space',
        });
        await queryInterface.addColumn('Bookings', 'title', {
            type: Sequelize.STRING
        });
        await queryInterface.addColumn('Bookings', 'notes', {
            type: Sequelize.TEXT
        });
        await queryInterface.addColumn('Bookings', 'status', {
            type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
            defaultValue: 'confirmed',
        });
        await queryInterface.addColumn('Bookings', 'cancelled_at', {
            type: Sequelize.DATE
        });
        await queryInterface.addColumn('Bookings', 'cancel_reason', {
            type: Sequelize.STRING
        });

        // 3. Add columns to AccessTiers
        await queryInterface.addColumn('AccessTiers', 'color', {
            type: Sequelize.STRING,
            defaultValue: '#6366f1',
        });
        await queryInterface.addColumn('AccessTiers', 'price', {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
        });
        await queryInterface.addColumn('AccessTiers', 'max_booking_hours', {
            type: Sequelize.INTEGER,
            defaultValue: 8,
        });
        await queryInterface.addColumn('AccessTiers', 'max_rooms', {
            type: Sequelize.INTEGER,
            defaultValue: 2,
        });
        await queryInterface.addColumn('AccessTiers', 'priority_booking', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
        await queryInterface.addColumn('AccessTiers', 'peak_access', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Spaces');
        await queryInterface.removeColumn('Bookings', 'space_id');
        await queryInterface.removeColumn('Bookings', 'type');
        await queryInterface.removeColumn('Bookings', 'title');
        await queryInterface.removeColumn('Bookings', 'notes');
        await queryInterface.removeColumn('Bookings', 'status');
        await queryInterface.removeColumn('Bookings', 'cancelled_at');
        await queryInterface.removeColumn('Bookings', 'cancel_reason');
        await queryInterface.removeColumn('AccessTiers', 'color');
        await queryInterface.removeColumn('AccessTiers', 'price');
        await queryInterface.removeColumn('AccessTiers', 'max_booking_hours');
        await queryInterface.removeColumn('AccessTiers', 'max_rooms');
        await queryInterface.removeColumn('AccessTiers', 'priority_booking');
        await queryInterface.removeColumn('AccessTiers', 'peak_access');
    }
};
