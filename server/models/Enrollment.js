const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  schoolYear: {
    type: String,
    required: true // e.g., "2025-2026"
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  hasTransport: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one enrollment per student per school year
EnrollmentSchema.index({ student: 1, schoolYear: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
