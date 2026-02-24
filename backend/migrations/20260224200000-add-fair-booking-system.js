'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Create BookingConfigs table
        await queryInterface.createTable('BookingConfigs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            resource_type: {
                type: Sequelize.ENUM('space', 'equipment', 'global'),
                defaultValue: 'global',
                allowNull: false
            },
            resource_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            weekly_hour_limit: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 6.0
            },
            max_active_bookings: {
                type: Sequelize.INTEGER,
                defaultValue: 3
            },
            cooldown_hours: {
                type: Sequelize.INTEGER,
                defaultValue: 24
            },
            no_show_warning_threshold: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            no_show_quota_reduction_threshold: {
                type: Sequelize.INTEGER,
                defaultValue: 2
            },
            no_show_suspension_threshold: {
                type: Sequelize.INTEGER,
                defaultValue: 3
            },
            no_show_window_days: {
                type: Sequelize.INTEGER,
                defaultValue: 30
            },
            waitlist_enabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            waitlist_claim_minutes: {
                type: Sequelize.INTEGER,
                defaultValue: 10
            },
            lock_duration_seconds: {
                type: Sequelize.INTEGER,
                defaultValue: 300
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            }
        });

        // 2. Create SlotLocks table
        await queryInterface.createTable('SlotLocks', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            resource_type: {
                type: Sequelize.ENUM('space', 'equipment'),
                allowNull: false
            },
            resource_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onDelete: 'CASCADE'
            },
            start_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            }
        });

        // Index on SlotLocks for fast lookup
        await queryInterface.addIndex('SlotLocks', ['resource_type', 'resource_id', 'start_time', 'end_time'], {
            name: 'slot_locks_resource_time_idx'
        });
        await queryInterface.addIndex('SlotLocks', ['expires_at'], {
            name: 'slot_locks_expires_idx'
        });

        // 3. Create WaitlistEntries table
        await queryInterface.createTable('WaitlistEntries', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            resource_type: {
                type: Sequelize.ENUM('space', 'equipment'),
                allowNull: false
            },
            resource_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            start_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onDelete: 'CASCADE'
            },
            position: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('waiting', 'offered', 'claimed', 'expired'),
                defaultValue: 'waiting'
            },
            offered_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            }
        });

        // Index on WaitlistEntries
        await queryInterface.addIndex('WaitlistEntries', ['resource_type', 'resource_id', 'start_time', 'status'], {
            name: 'waitlist_resource_time_status_idx'
        });

        // 4. Add check_in_time and duration to Bookings
        await queryInterface.addColumn('Bookings', 'check_in_time', {
            type: Sequelize.DATE,
            allowNull: true
        });

        await queryInterface.addColumn('Bookings', 'duration', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        });

        // 5. Add performance indexes to Bookings
        // These may already partially exist; use ifNotExists where possible
        try {
            await queryInterface.addIndex('Bookings', ['user_id', 'status', 'start_time'], {
                name: 'bookings_user_status_start_idx'
            });
        } catch (e) { /* index may already exist */ }

        try {
            await queryInterface.addIndex('Bookings', ['space_id', 'status', 'start_time', 'end_time'], {
                name: 'bookings_space_status_time_idx'
            });
        } catch (e) { /* index may already exist */ }

        try {
            await queryInterface.addIndex('Bookings', ['equipment_id', 'status', 'start_time', 'end_time'], {
                name: 'bookings_equipment_status_time_idx'
            });
        } catch (e) { /* index may already exist */ }

        // 6. Seed default global config
        await queryInterface.bulkInsert('BookingConfigs', [{
            resource_type: 'global',
            resource_id: null,
            weekly_hour_limit: 6.0,
            max_active_bookings: 3,
            cooldown_hours: 24,
            no_show_warning_threshold: 1,
            no_show_quota_reduction_threshold: 2,
            no_show_suspension_threshold: 3,
            no_show_window_days: 30,
            waitlist_enabled: false,
            waitlist_claim_minutes: 10,
            lock_duration_seconds: 300,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    async down(queryInterface, Sequelize) {
        // Remove indexes
        try { await queryInterface.removeIndex('Bookings', 'bookings_user_status_start_idx'); } catch (e) { }
        try { await queryInterface.removeIndex('Bookings', 'bookings_space_status_time_idx'); } catch (e) { }
        try { await queryInterface.removeIndex('Bookings', 'bookings_equipment_status_time_idx'); } catch (e) { }

        // Remove added columns
        await queryInterface.removeColumn('Bookings', 'check_in_time');
        await queryInterface.removeColumn('Bookings', 'duration');

        // Drop tables
        await queryInterface.dropTable('WaitlistEntries');
        await queryInterface.dropTable('SlotLocks');
        await queryInterface.dropTable('BookingConfigs');

        // Drop ENUMs created by PostgreSQL
        try { await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_BookingConfigs_resource_type";'); } catch (e) { }
        try { await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_SlotLocks_resource_type";'); } catch (e) { }
        try { await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WaitlistEntries_resource_type";'); } catch (e) { }
        try { await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WaitlistEntries_status";'); } catch (e) { }
    }
};
