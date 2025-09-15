const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get enrollments for a specific school year
// @route   GET /api/enrollments?schoolYear=2025-2026
// @access  Private
exports.getEnrollments = async (req, res, next) => {
  try {
    const { schoolYear } = req.query;
    const filter = schoolYear ? { schoolYear } : {};

    const enrollments = await Enrollment.find(filter)
      .populate('student', 'firstName lastName studentId')
      .populate('class', 'name')
      .populate('clubs', 'name');

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upsert a student's enrollment
// @route   POST /api/enrollments
// @access  Private
exports.upsertEnrollment = async (req, res, next) => {
  try {
    const { student, schoolYear, class: cls, clubs, hasTransport } = req.body;

    if (!student || !schoolYear) {
      return next(new ErrorResponse('Student and schoolYear are required', 400));
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { student, schoolYear },
      { student, schoolYear, class: cls, clubs, hasTransport },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Get a single student's enrollment by year
// @route   GET /api/enrollments?student=STUDENT_ID&schoolYear=2025-2026
// @access  Private
exports.getStudentEnrollment = async (req, res, next) => {
  try {
    const { student, schoolYear } = req.query;

    if (!student || !schoolYear) {
      return res.status(400).json({ success: false, error: 'Student and schoolYear are required' });
    }

    const enrollment = await Enrollment.findOne({ student, schoolYear })
      .populate('class', 'name')
      .populate('clubs', 'name');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    next(err);
  }
};
// @route GET /api/enrollments/single?student=ID&schoolYear=2024-2025
exports.getSingleEnrollment = async (req, res, next) => {
  const { student, schoolYear } = req.query;
  try {
    const enrollment = await Enrollment.findOne({ student, schoolYear })
      .populate('student', 'firstName lastName studentId')
      .populate('class', 'name')
      .populate('clubs', 'name');

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};