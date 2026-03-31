const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      is: /@bvrithyderabad\.edu\.in$/
    }
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('faculty', 'admin'),
    defaultValue: 'faculty'
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  departmentChangeRequestId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  departmentChangeStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: true
  },
  departmentChangeRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
