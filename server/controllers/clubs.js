const Club = require('../models/Club');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Private
exports.getClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().populate('memberCount');

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Private
exports.getClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id).populate('memberCount');

    if (!club) {
      return next(
        new ErrorResponse(`Club not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private
exports.createClub = async (req, res, next) => {
  try {
    const club = await Club.create(req.body);

    res.status(201).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private
exports.updateClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!club) {
      return next(
        new ErrorResponse(`Club not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private
exports.deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return next(
        new ErrorResponse(`Club not found with id of ${req.params.id}`, 404)
      );
    }

    await club.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};