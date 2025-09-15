const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadPhoto, uploadSchedule } = require('../controllers/uploads');
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, process.env.UPLOAD_PATH || './server/uploads');
  },
  filename: function(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  } else {
    return cb(new Error('Please upload only images'), false);
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: fileFilter
});

router.post('/photo', protect, upload.single('photo'), uploadPhoto);
router.post('/schedule', protect, upload.single('schedule'), uploadSchedule);

module.exports = router;