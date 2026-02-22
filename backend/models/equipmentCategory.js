'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EquipmentCategory extends Model {
        static associate(models) {
            EquipmentCategory.hasMany(models.Equipment, { foreignKey: 'category_id', as: 'Equipments' });
        }
    }
    EquipmentCategory.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: DataTypes.TEXT,
        icon: {
            type: DataTypes.STRING,
            defaultValue: 'Wrench'
        }
    }, {
        sequelize,
        modelName: 'EquipmentCategory',
        tableName: 'EquipmentCategories',
    });
    return EquipmentCategory;
};
