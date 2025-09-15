const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a club name'],
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add virtual for member count
ClubSchema.virtual('memberCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'clubs',
  count: true
});

// Set virtuals to true when converting to JSON
ClubSchema.set('toJSON', { virtuals: true });
ClubSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Club', ClubSchema);