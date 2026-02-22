'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Amenity extends Model {
        static associate(models) {
            // Amenities can be associated with many spaces or equipment if needed
            // For now, we'll keep it simple and use a many-to-many or JSON array reference
        }
    }
    Amenity.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: DataTypes.TEXT,
        icon: {
            type: DataTypes.STRING,
            defaultValue: 'Info'
        }
    }, {
        sequelize,
        modelName: 'Amenity',
        tableName: 'Amenities',
    });
    return Amenity;
};
