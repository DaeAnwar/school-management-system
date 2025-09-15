const Student = require('../models/Student');
const ErrorResponse = require('../utils/errorResponse');
const Fee = require('../models/Fee');
const Enrollment = require('../models/Enrollment'); // ⬅️ add this line

const { getCurrentSchoolYear } = require('../utils/dateUtils'); // we'll add this next
// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };
const schoolYear = req.query.schoolYear;

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Handle search
    if (req.query.search) {
      const searchTerm = req.query.search;
      reqQuery.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { studentId: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
   let query = Student.find(JSON.parse(queryStr))
  .populate({
    path: 'enrollments',
    match: schoolYear ? { schoolYear } : {}, // ✅ match specific year
    populate: [
      { path: 'class', select: 'name' },
      { path: 'clubs', select: 'name' }
    ]
  });
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

   // ✅ STEP: Filter by schoolYear if provided
if (schoolYear) {
  const paidFees = await Fee.find({
    schoolYear,
    month: 9,
    items: {
      $elemMatch: {
        type: 'inscription',
        paid: { $gt: 0 }
      }
    }
  }).select('student');

  const eligibleStudentIds = paidFees.map(fee => fee.student.toString());

  query = query.where('_id').in(eligibleStudentIds);
}

// ✅ Pagination (MUST go after filtering)
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 15;
const startIndex = (page - 1) * limit;
const endIndex = page * limit;
const total = await query.clone().countDocuments();

query = query.skip(startIndex).limit(limit);

    // Execute query
    const students = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: students.length,
      pagination,
      data: students,
      total
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
  .populate({
    path: 'enrollments',
    populate: [
      { path: 'class', select: 'name' },
      { path: 'clubs', select: 'name' }
    ]
  })
  .populate({
    path: 'fees',
    populate: {
      path: 'feeType'
    }
  });

    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    // Create initial fees for this student
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const schoolYear = getCurrentSchoolYear(today);

    // Generate school months (Sep to current month if in school year)
    const months =
      currentMonth >= 9
        ? Array.from({ length: currentMonth - 8 }, (_, i) => i + 9) // Sep to current
        : Array.from({ length: currentMonth + 4 }, (_, i) => i + 1); // Jan to current

    const baseTypes = ['tuition', 'transport', 'club'];

    for (const month of months) {
      const types = [...baseTypes];
      if (month === 9) types.push('inscription');

      const items = types.map(type => ({
        type,
        due: 0,
        paid: 0,
        date: new Date()
      }));

      await Fee.create({
        student: student._id,
        schoolYear,
        month,
        items
      });
    }

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return next(
        new ErrorResponse(`Student not found with id of ${req.params.id}`, 404)
      );
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};