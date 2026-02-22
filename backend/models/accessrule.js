'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AccessRule extends Model {
        static associate(models) {
            // No specific associations needed for now as we store IDs in JSONB
        }
    }
    AccessRule.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        schedule: DataTypes.STRING,
        tiers: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        spaces: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'AccessRule',
    });
    return AccessRule;
};
