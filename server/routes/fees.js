// routes/fees.js
const express = require('express');
const router = express.Router();
const feesController = require('../controllers/fees');
const Fee = require('../models/Fee');
const Enrollment = require('../models/Enrollment');
const { getCurrentSchoolYear } = require('../utils/dateUtils');

// Add or update fee for a student
router.post('/:studentId', feesController.upsertFee);

// Get a student's full-year fee breakdown
router.get('/student/:studentId', feesController.getStudentFeesByYear);

// Get all fees for a specific month with a specific status
router.get('/status/filter', feesController.getFeesByMonthStatus);

// Get all students with their fee status for a month
router.get('/', feesController.getAllStudentsFees);

// ✅ Return all school years (past + current)
// routes/fees.js
router.get('/school-years', async (req, res) => {
  try {
    const feeYears = await Fee.distinct('schoolYear');
    const enrollmentYears = await Enrollment.distinct('schoolYear');
    let years = Array.from(new Set([...feeYears, ...enrollmentYears]));

    // Always include current year
    const currentYear = getCurrentSchoolYear();
    if (!years.includes(currentYear)) years.push(currentYear);

    // Always include previous year for traceability
    const [start] = currentYear.split('-').map(Number);
    const prevYear = `${start - 1}-${start}`;
    if (!years.includes(prevYear)) years.push(prevYear);

    // Sort years properly (by first year number)
    years.sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]));

    res.status(200).json({ success: true, data: years });
  } catch (err) {
    console.error('❌ Failed to load school years:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
