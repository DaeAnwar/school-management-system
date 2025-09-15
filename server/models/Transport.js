const mongoose = require('mongoose');

const TransportSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: [true, 'Please add a vehicle name'],
    trim: true
  },
  route: {
    type: String,
    required: [true, 'Please add a route']
  },
  driverName: {
    type: String,
    required: [true, 'Please add driver name']
  },
  driverPhone: {
    type: String,
    required: [true, 'Please add driver phone']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add virtual for transport users count
TransportSchema.virtual('usersCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'hasTransport',
  count: true,
  match: { hasTransport: true }
});

// Set virtuals to true when converting to JSON
TransportSchema.set('toJSON', { virtuals: true });
TransportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transport', TransportSchema);