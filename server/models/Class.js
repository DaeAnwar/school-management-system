const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
   name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true
  },
  schoolYear: {
    type: String,
    required: [true, 'Please specify the school year'],
  },
  teachers: {
    type: [String],
    required: [true, 'Please add at least one teacher']
  },
  scheduleImage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// Add virtual for student count
ClassSchema.virtual('studentCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'class',
  count: true
});

// Set virtuals to true when converting to JSON
ClassSchema.set('toJSON', { virtuals: true });
ClassSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Class', ClassSchema);