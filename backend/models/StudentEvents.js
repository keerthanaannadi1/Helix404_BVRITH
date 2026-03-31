const mongoose = require('mongoose');

// Example section model with file upload support
const studentEventsSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Section-specific fields
  eventName: {
    type: String,
    required: true
  },
  resourcePerson: String,
  coordinator: String,
  studentsCount: Number,
  dateFrom: Date,
  dateTo: Date,
  
  // File upload support
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentEvents', studentEventsSchema);
