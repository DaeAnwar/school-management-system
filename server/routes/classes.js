const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classes');

router.route('/')
  .get(protect, getClasses)
  .post(protect, createClass);

router.route('/:id')
  .get(protect, getClass)
  .put(protect, updateClass)
  .delete(protect, deleteClass);

module.exports = router;