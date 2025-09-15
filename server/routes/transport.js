const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransports,
  getTransport,
  createTransport,
  updateTransport,
  deleteTransport
} = require('../controllers/transport');

router.route('/')
  .get(protect, getTransports)
  .post(protect, createTransport);

router.route('/:id')
  .get(protect, getTransport)
  .put(protect, updateTransport)
  .delete(protect, deleteTransport);

module.exports = router;