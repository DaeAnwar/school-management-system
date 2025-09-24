const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/students');

// List all students / Create student
router.route('/')
  .get(protect, getStudents)      // ✅ uses getStudents controller
  .post(protect, createStudent);  // ✅ uses createStudent controller

// Get one / Update / Delete
router.route('/:id')
  .get(protect, getStudent)       // ✅ uses getStudent controller
  .put(protect, updateStudent)    // ✅ uses updateStudent controller
  .delete(protect, deleteStudent);// ✅ uses deleteStudent controller

module.exports = router;
