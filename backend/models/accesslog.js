'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccessLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AccessLog.belongsTo(models.User, { foreignKey: 'user_id' });
      AccessLog.belongsTo(models.Device, { foreignKey: 'device_id' });
    }
  }
  AccessLog.init({
    user_id: DataTypes.INTEGER,
    method: DataTypes.STRING,
    decision: DataTypes.STRING,
    device_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'AccessLog',
  });
  return AccessLog;
};