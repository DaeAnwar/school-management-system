const express = require('express');
const router = express.Router();
const { getStudentEnrollment } = require('../controllers/enrollmentController');

const {
  getEnrollments,
  upsertEnrollment
} = require('../controllers/enrollmentController');

router.get('/', getEnrollments);
router.post('/', upsertEnrollment);
router.get('/single', getStudentEnrollment); // GET /api/enrollments/single

module.exports = router;
