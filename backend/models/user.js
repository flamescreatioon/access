'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
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
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_status: {
      type: DataTypes.STRING,
      defaultValue: 'INVITED'
    },
    onboarding_status: {
      type: DataTypes.STRING,
      defaultValue: 'NOT_STARTED'
    },
    activation_status: {
      type: DataTypes.STRING,
      defaultValue: 'INCOMPLETE'
    },
    payment_status: {
      type: DataTypes.STRING,
      defaultValue: 'NOT_REQUESTED'
    },
    first_login_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    profile_complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phone: DataTypes.STRING,
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