const mongoose = require('mongoose');

const feeItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['inscription', 'tuition', 'transport', 'club'],
    required: true,
  },
  due: {
    type: Number,
    required: true,
    default: 0,
  },
  paid: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  schoolYear: {
    type: String, // e.g., "2025-2026"
    required: true,
  },
  month: {
    type: Number, // 1 = Jan, 9 = Sep, etc.
    required: true,
  },
  items: [feeItemSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 🔐 Unique index: 1 month, 1 schoolYear, 1 student = 1 record
feeSchema.index({ student: 1, schoolYear: 1, month: 1 }, { unique: true });

// 💰 Virtuals
feeSchema.virtual('totalDue').get(function () {
  return this.items.reduce((sum, item) => sum + item.due, 0);
});

feeSchema.virtual('totalPaid').get(function () {
  return this.items.reduce((sum, item) => sum + item.paid, 0);
});

feeSchema.virtual('status').get(function () {
  const totalDue = this.totalDue;
  const totalPaid = this.totalPaid;

  if (totalPaid >= totalDue && totalDue > 0) return 'paid';
  if (totalPaid > 0 && totalPaid < totalDue) return 'partial';
  return 'unpaid';
});

module.exports = mongoose.model('Fee', feeSchema);
