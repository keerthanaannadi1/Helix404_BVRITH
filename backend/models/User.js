const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /@bvrithyderabad\.edu\.in$/
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['faculty', 'admin'],
    default: 'faculty'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  departmentChangeRequest: {
    requestedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    requestedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
