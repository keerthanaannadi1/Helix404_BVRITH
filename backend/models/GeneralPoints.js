const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GeneralPoints = sequelize.define('GeneralPoints', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reportId: { type: DataTypes.INTEGER, allowNull: false },
  departmentId: { type: DataTypes.INTEGER, allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('meeting', 'announcement', 'other'), defaultValue: 'other' },
  attachments: { type: DataTypes.JSONB, defaultValue: [] }
}, { tableName: 'general_points', timestamps: true });

module.exports = GeneralPoints;
