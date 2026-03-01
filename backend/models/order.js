'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
            Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
        }
    }
    Order.init({
        order_reference: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(
                'PENDING_PAYMENT',
                'PAYMENT_UNDER_REVIEW',
                'PAYMENT_CONFIRMED',
                'PREPARING',
                'READY_FOR_PICKUP',
                'COMPLETED',
                'CANCELLED',
                'REJECTED'
            ),
            defaultValue: 'PENDING_PAYMENT'
        }
    }, {
        sequelize,
        modelName: 'Order',
        tableName: 'Orders',
    });
    return Order;
};
