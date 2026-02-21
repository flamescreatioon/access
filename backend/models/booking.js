'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'user_id' });
      Booking.belongsTo(models.Space, { foreignKey: 'space_id' });
      Booking.belongsTo(models.Equipment, { foreignKey: 'equipment_id' });
    }
  }

  Booking.init({
    user_id: DataTypes.INTEGER,
    space_id: DataTypes.INTEGER,
    equipment_id: DataTypes.INTEGER,
    resource_id: DataTypes.INTEGER, // Legacy field
    type: {
      type: DataTypes.ENUM('space', 'equipment'),
      defaultValue: 'space',
    },
    title: DataTypes.STRING,
    notes: DataTypes.TEXT,
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
      defaultValue: 'confirmed',
    },
    cancelled_at: DataTypes.DATE,
    cancel_reason: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Booking',
  });

  return Booking;
};