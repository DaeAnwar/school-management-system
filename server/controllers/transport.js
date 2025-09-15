const Transport = require('../models/Transport');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all transports
// @route   GET /api/transport
// @access  Private
exports.getTransports = async (req, res, next) => {
  try {
    const transports = await Transport.find().populate('usersCount');

    res.status(200).json({
      success: true,
      count: transports.length,
      data: transports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single transport
// @route   GET /api/transport/:id
// @access  Private
exports.getTransport = async (req, res, next) => {
  try {
    const transport = await Transport.findById(req.params.id).populate('usersCount');

    if (!transport) {
      return next(
        new ErrorResponse(`Transport not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: transport
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new transport
// @route   POST /api/transport
// @access  Private
exports.createTransport = async (req, res, next) => {
  try {
    const transport = await Transport.create(req.body);

    res.status(201).json({
      success: true,
      data: transport
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update transport
// @route   PUT /api/transport/:id
// @access  Private
exports.updateTransport = async (req, res, next) => {
  try {
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!transport) {
      return next(
        new ErrorResponse(`Transport not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: transport
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete transport
// @route   DELETE /api/transport/:id
// @access  Private
exports.deleteTransport = async (req, res, next) => {
  try {
    const transport = await Transport.findById(req.params.id);

    if (!transport) {
      return next(
        new ErrorResponse(`Transport not found with id of ${req.params.id}`, 404)
      );
    }

    await transport.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};