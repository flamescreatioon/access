'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Membership.belongsTo(models.User, { foreignKey: 'user_id' });
      Membership.belongsTo(models.AccessTier, { foreignKey: 'tier_id' });
    }
  }
  Membership.init({
    user_id: DataTypes.INTEGER,
    tier_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    expiry_date: DataTypes.DATE,
    auto_renew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    payment_method: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};