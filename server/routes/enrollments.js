const express = require('express');
const router = express.Router();
const { getStudentEnrollment } = require('../controllers/enrollments');

const {
  getEnrollments,
  upsertEnrollment
} = require('../controllers/enrollmentController');

router.get('/', getEnrollments);
router.post('/', upsertEnrollment);
router.get('/single', protect, getStudentEnrollment); // GET /api/enrollments/single

module.exports = router;
