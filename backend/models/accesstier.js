'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccessTier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AccessTier.hasMany(models.Membership, { foreignKey: 'tier_id' });
    }
  }
  AccessTier.init({
    name: DataTypes.STRING,
    permissions: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AccessTier',
  });
  return AccessTier;
};