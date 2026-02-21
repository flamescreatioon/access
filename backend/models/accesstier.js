'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccessTier extends Model {
    static associate(models) {
      AccessTier.hasMany(models.Membership, { foreignKey: 'tier_id' });
      AccessTier.hasMany(models.Space, { foreignKey: 'min_tier_id' });
    }
  }

  AccessTier.init({
    name: DataTypes.STRING,
    permissions: DataTypes.TEXT,
    color: {
      type: DataTypes.STRING,
      defaultValue: '#6366f1',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    max_booking_hours: {
      type: DataTypes.INTEGER,
      defaultValue: 8, // per month, -1 = unlimited
    },
    max_rooms: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // concurrent, -1 = unlimited
    },
    priority_booking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    peak_access: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'AccessTier',
  });

  return AccessTier;
};