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
    enum: ['Male', 'Female']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please add date of birth']
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

  // ❌ removed class reference, because class changes per school year and is tracked in Enrollment

  profilePhoto: {
    type: String,
    default: 'default.jpg'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },

  fees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fee'
    }
  ],

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
StudentSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  const year = new Date().getFullYear().toString().substr(-2);

  const count = await this.constructor.countDocuments();
  const formattedCount = (count + 1).toString().padStart(4, '0');

  this.studentId = `STU${year}${formattedCount}`;

  next();
});

// Virtual: full name
StudentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: age
StudentSchema.virtual('age').get(function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', StudentSchema);
