'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WaitlistEntry extends Model {
        static associate(models) {
            WaitlistEntry.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        }
    }

    WaitlistEntry.init({
        resource_type: {
            type: DataTypes.ENUM('space', 'equipment'),
            allowNull: false
        },
        resource_id: {
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('waiting', 'offered', 'claimed', 'expired'),
            defaultValue: 'waiting'
        },
        offered_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'WaitlistEntry',
        tableName: 'WaitlistEntries',
    });

    return WaitlistEntry;
};
