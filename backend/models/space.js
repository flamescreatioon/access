'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Space extends Model {
        static associate(models) {
            Space.belongsTo(models.AccessTier, { foreignKey: 'min_tier_id', as: 'MinTier' });
            Space.belongsTo(models.SpaceCategory, { foreignKey: 'category_id', as: 'Category' });
            Space.hasMany(models.Booking, { foreignKey: 'space_id' });
        }
    }

    Space.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: DataTypes.TEXT,
        type: {
            type: DataTypes.ENUM('meeting_room', 'coworking', 'studio', 'lab', 'event_space', 'private_office'),
            defaultValue: 'meeting_room',
        },
        capacity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        amenities: {
            type: DataTypes.TEXT, // JSON string array
            defaultValue: '[]',
            get() {
                const raw = this.getDataValue('amenities');
                try { return JSON.parse(raw); } catch { return []; }
            },
            set(val) {
                this.setDataValue('amenities', JSON.stringify(val || []));
            },
        },
        photos: {
            type: DataTypes.TEXT, // JSON string array of URLs
            defaultValue: '[]',
            get() {
                const raw = this.getDataValue('photos');
                try { return JSON.parse(raw); } catch { return []; }
            },
            set(val) {
                this.setDataValue('photos', JSON.stringify(val || []));
            },
        },
        rules: DataTypes.TEXT,
        min_tier_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        hourly_rate: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        max_booking_hours: {
            type: DataTypes.INTEGER,
            defaultValue: 4, // hours per session
        },
        pricing_model: {
            type: DataTypes.ENUM('hourly', 'daily'),
            defaultValue: 'hourly',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        location: DataTypes.STRING,
        zone: {
            type: DataTypes.ENUM('Annex', 'Right Wing', 'Left Wing'),
            allowNull: true
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Space',
        tableName: 'Spaces',
    });

    return Space;
};
