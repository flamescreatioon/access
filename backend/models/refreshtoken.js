'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  RefreshToken.init({
    user_id: DataTypes.INTEGER,
    token: DataTypes.TEXT,
    device_info: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    last_used_at: DataTypes.DATE,
    expires_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RefreshToken',
  });
  return RefreshToken;
};