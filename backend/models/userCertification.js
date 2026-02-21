'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserCertification extends Model {
        static associate(models) {
            UserCertification.belongsTo(models.User, { foreignKey: 'user_id' });
            UserCertification.belongsTo(models.User, { foreignKey: 'certified_by', as: 'Certifier' });
        }
    }
    UserCertification.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        certification_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        certified_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        expires_at: DataTypes.DATE,
        certified_by: DataTypes.INTEGER,
        notes: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'UserCertification',
    });
    return UserCertification;
};
