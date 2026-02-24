'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SlotLock extends Model {
        static associate(models) {
            SlotLock.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        }
    }

    SlotLock.init({
        resource_type: {
            type: DataTypes.ENUM('space', 'equipment'),
            allowNull: false
        },
        resource_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'SlotLock',
        tableName: 'SlotLocks',
    });

    return SlotLock;
};
