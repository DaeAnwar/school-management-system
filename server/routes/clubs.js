const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub
} = require('../controllers/clubs');

router.route('/')
  .get(protect, getClubs)
  .post(protect, createClub);

router.route('/:id')
  .get(protect, getClub)
  .put(protect, updateClub)
  .delete(protect, deleteClub);

module.exports = router;