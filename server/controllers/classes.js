const Class = require('../models/Class');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res, next) => {
  try {
const query = {};

if (req.query.schoolYear) {
  query.schoolYear = req.query.schoolYear;
}

const classes = await Class.find(query).populate('studentCount');
    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate('studentCount');

    if (!cls) {
      return next(
        new ErrorResponse(`Class not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: cls
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private
exports.createClass = async (req, res, next) => {
  try {
    const cls = await Class.create(req.body);

    res.status(201).json({
      success: true,
      data: cls
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private
exports.updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!cls) {
      return next(
        new ErrorResponse(`Class not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: cls
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private
exports.deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return next(
        new ErrorResponse(`Class not found with id of ${req.params.id}`, 404)
      );
    }

    await cls.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};