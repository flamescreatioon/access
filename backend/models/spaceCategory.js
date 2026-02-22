'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SpaceCategory extends Model {
        static associate(models) {
            SpaceCategory.hasMany(models.Space, { foreignKey: 'category_id', as: 'Spaces' });
        }
    }
    SpaceCategory.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: DataTypes.TEXT,
        icon: {
            type: DataTypes.STRING,
            defaultValue: 'Layout'
        }
    }, {
        sequelize,
        modelName: 'SpaceCategory',
        tableName: 'SpaceCategories',
    });
    return SpaceCategory;
};
