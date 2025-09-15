const ErrorResponse = require('../utils/errorResponse');

// @desc    Upload student photo
// @route   POST /api/uploads/photo
// @access  Private
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    res.status(200).json({
      success: true,
      data: req.file.filename
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload class schedule
// @route   POST /api/uploads/schedule
// @access  Private
exports.uploadSchedule = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    res.status(200).json({
      success: true,
      data: req.file.filename
    });
  } catch (err) {
    next(err);
  }
};