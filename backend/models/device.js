'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Device.hasMany(models.AccessLog, { foreignKey: 'device_id' });
    }
  }
  Device.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    api_key: DataTypes.STRING,
    location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};