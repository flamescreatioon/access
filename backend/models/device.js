'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      Device.belongsTo(models.User, { foreignKey: 'user_id' });
      Device.hasMany(models.AccessLog, { foreignKey: 'device_id' });
    }
  }
  Device.init({
    name: DataTypes.STRING,
    type: {
      type: DataTypes.STRING,
      defaultValue: 'door_scanner',
    },
    api_key: DataTypes.STRING,
    location: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'PENDING_ACTIVATION',
      // PENDING_ACTIVATION, ACTIVE_SCANNER, SUSPENDED, REVOKED
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    scanner_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    device_fingerprint: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_activity: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    activated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    activated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};