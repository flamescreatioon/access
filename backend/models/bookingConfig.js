'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BookingConfig extends Model {
        static associate(models) {
            // No associations needed — config is looked up by resource_type/resource_id
        }
    }

    BookingConfig.init({
        resource_type: {
            type: DataTypes.ENUM('space', 'equipment', 'global'),
            defaultValue: 'global',
            allowNull: false
        },
        resource_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        weekly_hour_limit: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 6.0
        },
        max_active_bookings: {
            type: DataTypes.INTEGER,
            defaultValue: 3
        },
        cooldown_hours: {
            type: DataTypes.INTEGER,
            defaultValue: 24
        },
        no_show_warning_threshold: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        no_show_quota_reduction_threshold: {
            type: DataTypes.INTEGER,
            defaultValue: 2
        },
        no_show_suspension_threshold: {
            type: DataTypes.INTEGER,
            defaultValue: 3
        },
        no_show_window_days: {
            type: DataTypes.INTEGER,
            defaultValue: 30
        },
        waitlist_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        waitlist_claim_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        lock_duration_seconds: {
            type: DataTypes.INTEGER,
            defaultValue: 300
        }
    }, {
        sequelize,
        modelName: 'BookingConfig',
        tableName: 'BookingConfigs',
    });

    return BookingConfig;
};
