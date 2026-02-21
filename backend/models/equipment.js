'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Equipment extends Model {
        static associate(models) {
            Equipment.belongsTo(models.AccessTier, { foreignKey: 'min_tier_id', as: 'MinTier' });
            Equipment.hasMany(models.Booking, { foreignKey: 'equipment_id' });
        }
    }
    Equipment.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        status: {
            type: DataTypes.ENUM('available', 'in_use', 'maintenance'),
            defaultValue: 'available'
        },
        photo: DataTypes.STRING,
        safety_guidelines: DataTypes.TEXT,
        requires_certification: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        certification_name: DataTypes.STRING,
        hourly_cost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        max_session_hours: {
            type: DataTypes.INTEGER,
            defaultValue: 4
        },
        daily_limit_hours: {
            type: DataTypes.INTEGER,
            defaultValue: 8
        },
        min_tier_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        location: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Equipment',
        tableName: 'Equipments',
    });
    return Equipment;
};
