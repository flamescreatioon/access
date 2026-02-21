'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccessLog extends Model {
    static associate(models) {
      AccessLog.belongsTo(models.User, { foreignKey: 'user_id' });
      AccessLog.belongsTo(models.Device, { foreignKey: 'device_id' });
    }
  }
  AccessLog.init({
    user_id: DataTypes.INTEGER,
    method: {
      type: DataTypes.STRING,
      defaultValue: 'qr_scan',
    },
    decision: DataTypes.STRING,        // Grant, Deny
    device_id: DataTypes.INTEGER,
    manager_id: {                       // Hub Manager who performed the scan
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    scan_payload: {                     // Raw QR token data
      type: DataTypes.TEXT,
      allowNull: true,
    },
    backend_decision: {                 // What the backend returned: VALID, DENIED
      type: DataTypes.STRING,
      allowNull: true,
    },
    manager_decision: {                 // What the manager chose: GRANT, DENY
      type: DataTypes.STRING,
      allowNull: true,
    },
    deny_reason: {                      // Why denied (expired, suspended, etc.)
      type: DataTypes.STRING,
      allowNull: true,
    },
    override: {                         // Was an override used?
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    override_reason: {                  // Manager's reason for override
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'AccessLog',
  });
  return AccessLog;
};