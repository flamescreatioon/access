'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Membership, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.AccessLog, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.UserCertification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.AuditLog, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.Device, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.PushSubscription, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
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
    matric_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          push: true,
          email: true,
          types: {
            booking: true,
            access: true,
            security: true,
            system: true,
            membership: true
          },
          marketing: false
        },
        theme: 'dark'
      }
    },
    is_inside: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    access_code: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    access_code_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};