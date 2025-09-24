// routes/schoolYears.js
const express = require('express');
const router = express.Router();
const { getSchoolYears, createSchoolYear } = require('../controllers/schoolYearController');

// GET /api/school-years
router.get('/', getSchoolYears);

// POST /api/school-years
router.post('/', createSchoolYear);

module.exports = router;
