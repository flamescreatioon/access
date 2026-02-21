'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, { foreignKey: 'user_id' });
        }
    }
    Notification.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('booking', 'membership', 'access', 'system'),
            defaultValue: 'system'
        },
        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        data: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        channel: {
            type: DataTypes.STRING,
            defaultValue: 'in_app'
        }
    }, {
        sequelize,
        modelName: 'Notification',
    });
    return Notification;
};
