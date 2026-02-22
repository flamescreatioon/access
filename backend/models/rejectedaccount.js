'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class RejectedAccount extends Model {
        static associate(models) {
            // Potentially associate with the admin who rejected (rejected_by)
            RejectedAccount.belongsTo(models.User, { foreignKey: 'rejected_by', as: 'Admin', onDelete: 'SET NULL' });
        }
    }
    RejectedAccount.init({
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        department: DataTypes.STRING,
        level: DataTypes.STRING,
        role: DataTypes.STRING,
        reason: DataTypes.TEXT,
        rejected_by: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'RejectedAccount',
    });
    return RejectedAccount;
};
