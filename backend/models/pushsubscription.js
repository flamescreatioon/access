'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PushSubscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PushSubscription.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  PushSubscription.init({
    user_id: DataTypes.INTEGER,
    endpoint: DataTypes.TEXT,
    p256dh: DataTypes.STRING,
    auth: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PushSubscription',
  });
  return PushSubscription;
};