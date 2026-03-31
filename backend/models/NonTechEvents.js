const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const NonTechEvents = sequelize.define('NonTechEvents', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reportId: { type: DataTypes.INTEGER, allowNull: false },
  departmentId: { type: DataTypes.INTEGER, allowNull: false },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  data: { type: DataTypes.JSONB, defaultValue: {} },
  attachments: { type: DataTypes.JSONB, defaultValue: [] }
}, { tableName: 'non_tech_events', timestamps: true });

module.exports = NonTechEvents;
