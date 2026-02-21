'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Membership, { foreignKey: 'user_id' });
      User.hasMany(models.AccessLog, { foreignKey: 'user_id' });
      User.hasMany(models.Booking, { foreignKey: 'user_id' });
      User.hasMany(models.UserCertification, { foreignKey: 'user_id' });
      User.hasMany(models.AuditLog, { foreignKey: 'user_id' });
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    role: DataTypes.STRING,
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          push: true,
          email: true,
          marketing: false
        },
        theme: 'dark'
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};