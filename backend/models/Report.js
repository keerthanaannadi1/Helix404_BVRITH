const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null  // null = institution-wide
  },
  reportType: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'weekly'
  },
  status: {
    type: String,
    enum: ['active', 'generated'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
