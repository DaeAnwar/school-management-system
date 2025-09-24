// controllers/schoolYearController.js
const SchoolYear = require('../models/SchoolYear');

// @desc Get all school years
exports.getSchoolYears = async (req, res) => {
  try {
    const years = await SchoolYear.find().sort({ year: 1 });
    res.status(200).json({ success: true, data: years });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc Create a new school year
exports.createSchoolYear = async (req, res) => {
  try {
    const { year, isCurrent } = req.body;

    if (!year) {
      return res.status(400).json({ success: false, error: 'Year is required' });
    }

    if (isCurrent) {
      // Set all others to false
      await SchoolYear.updateMany({}, { isCurrent: false });
    }

    const newYear = await SchoolYear.create({ year, isCurrent });
    res.status(201).json({ success: true, data: newYear });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
