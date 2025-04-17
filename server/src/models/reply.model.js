
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reply = sequelize.define('Reply', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Reply;
