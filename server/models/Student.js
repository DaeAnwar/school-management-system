const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  gender: {
    type: String,
    required: [true, 'Please specify gender'],
    enum: ['Male', 'Female', 'Other']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please assign a class']
  },
  fatherName: {
    type: String,
    required: [true, 'Please add father name']
  },
  fatherPhone: {
    type: String,
    required: [true, 'Please add father phone']
  },
  motherName: {
    type: String,
    required: [true, 'Please add mother name']
  },
  motherPhone: {
    type: String,
    required: [true, 'Please add mother phone']
  },
  address1: {
    type: String,
    required: [true, 'Please add address']
  },
  address2: {
    type: String
  },
  otherContact: {
    type: String
  },
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  hasTransport: {
    type: Boolean,
    default: false
  },
  profilePhoto: {
    type: String,
    default: 'default.jpg'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  fees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fee'
  }],
  enrollments: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment'
  }
],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate student ID before saving
StudentSchema.pre('save', async function(next) {
  // Only generate ID if it's a new student
  if (!this.isNew) {
    return next();
  }

  // Get current year
  const year = new Date().getFullYear().toString().substr(-2);
  
  // Get the count of all students and format with leading zeros
  const count = await this.constructor.countDocuments();
  const formattedCount = (count + 1).toString().padStart(4, '0');
  
  // Set the student ID
  this.studentId = `STU${year}${formattedCount}`;
  
  next();
});

// Add virtual for full name
StudentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Add virtual for age calculation
StudentSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Set virtuals to true when converting to JSON
StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', StudentSchema);