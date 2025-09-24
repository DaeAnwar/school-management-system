// models/SchoolYear.js
const mongoose = require('mongoose');

const SchoolYearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    unique: true, // e.g., "2025-2026"
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('SchoolYear', SchoolYearSchema);
