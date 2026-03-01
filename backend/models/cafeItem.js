'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CafeItem extends Model {
        static associate(models) {
            CafeItem.hasMany(models.OrderItem, { foreignKey: 'cafe_item_id' });
        }
    }
    CafeItem.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        image_url: DataTypes.STRING,
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'CafeItem',
        tableName: 'CafeItems',
    });
    return CafeItem;
};
