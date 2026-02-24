'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
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
      defaultValue: 'pending',
    },
    cancelled_at: DataTypes.DATE,
    cancel_reason: DataTypes.STRING,
    check_in_time: DataTypes.DATE,
    duration: {
      type: DataTypes.VIRTUAL,
      get() {
        const start = this.getDataValue('start_time');
        const end = this.getDataValue('end_time');
        if (start && end) {
          return (new Date(end) - new Date(start)) / 3600000;
        }
        return null;
      }
    },
  }, {
    sequelize,
    modelName: 'Booking',
  });

  return Booking;
};