const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  weekStart: { type: DataTypes.DATE, allowNull: false },
  weekEnd: { type: DataTypes.DATE, allowNull: false },
  departmentId: { type: DataTypes.INTEGER },
  reportType: { type: DataTypes.ENUM('weekly', 'monthly', 'yearly'), defaultValue: 'weekly' },
  status: { type: DataTypes.ENUM('active', 'generated'), defaultValue: 'active' },
  createdBy: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'reports', timestamps: true });

module.exports = Report;
