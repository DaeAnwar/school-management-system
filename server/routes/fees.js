const express = require('express');
const router = express.Router();
const feesController = require('../controllers/fees');

// Add or update fee for a student
router.post('/:studentId', feesController.upsertFee);

// Get a student's full-year fee breakdown
router.get('/student/:studentId', feesController.getStudentFeesByYear);

// Get all fees for a specific month with a specific status
router.get('/status/filter', feesController.getFeesByMonthStatus);

// Get all students with their fee status for a month
router.get('/', feesController.getAllStudentsFees);
router.get('/school-years', async (req, res) => {
  try {
    const years = await Fee.distinct('schoolYear');
    const sorted = years.sort(); // optional: sort alphabetically
    res.status(200).json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;
