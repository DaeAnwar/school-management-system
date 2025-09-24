// controllers/students.js
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const Fee = require('../models/Fee');
const ErrorResponse = require('../utils/errorResponse');
const { getCurrentSchoolYear } = require('../utils/dateUtils');

// @desc    Get all students with enrollment info
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const {
      schoolYear,
      class: classId,
      club: clubId,
      transport,
      search,
      select,
      sort,
      page: pageStr,
      limit: limitStr
    } = req.query;

    const studentFilter = {};
    if (search) {
      const rx = new RegExp(search, 'i');
      studentFilter.$or = [
        { firstName: rx },
        { lastName: rx },
        { studentId: rx }
      ];
    }

    // ---------- Case A: no schoolYear ----------
    if (!schoolYear) {
      let q = Student.find(studentFilter).populate({
        path: 'enrollments',
        populate: [
          { path: 'class', select: 'name' },
          { path: 'clubs', select: 'name' }
        ]
      });

      if (select) q = q.select(select.split(',').join(' '));
      q = sort ? q.sort(sort.split(',').join(' ')) : q.sort('-createdAt');

      const page = parseInt(pageStr, 10) || 1;
      const limit = parseInt(limitStr, 10) || 15;
      const skip = (page - 1) * limit;

      const total = await Student.countDocuments(studentFilter);
      const students = await q.skip(skip).limit(limit).lean();

      const enriched = students.map(s => {
        const enr = s.enrollments?.[0];
        return {
          ...s,
          class: enr?.class || null,
          hasTransport: enr?.hasTransport || false,
          clubs: enr?.clubs || [],
          enrolled: !!enr
        };
      });

      return res.status(200).json({
        success: true,
        count: enriched.length,
        total,
        pagination: {
          next: skip + enriched.length < total ? { page: page + 1, limit } : undefined,
          prev: skip > 0 ? { page: page - 1, limit } : undefined
        },
        data: enriched
      });
    }

// ---------- Case B: with schoolYear ----------
const enrollmentFilter = { schoolYear };
if (clubId && clubId !== 'all') enrollmentFilter.clubs = clubId;
if (transport === 'yes') enrollmentFilter.hasTransport = true;
if (transport === 'no') enrollmentFilter.hasTransport = false;

// Fetch enrollments only for this year
const enrollments = await Enrollment.find(enrollmentFilter)
  .populate('class', 'name')
  .populate('clubs', 'name')
  .lean();

const byStudent = new Map(enrollments.map(e => [e.student.toString(), e]));

let students = [];
let total = 0;

const page = parseInt(pageStr, 10) || 1;
const limit = parseInt(limitStr, 10) || 15;
const skip = (page - 1) * limit;

if (classId && classId !== 'all') {
  // Students enrolled in this class in this year
  const classEnrollments = enrollments.filter(e => e.class?._id?.toString() === classId);
  const enrolledIds = classEnrollments.map(e => e.student.toString());

  students = await Student.find({ ...studentFilter, _id: { $in: enrolledIds } })
    .sort(sort ? sort.split(',').join(' ') : '-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  total = await Student.countDocuments({ ...studentFilter, _id: { $in: enrolledIds } });
} else {
  // All Classes → show ALL students, but only mark as enrolled if they have enrollment this year
  students = await Student.find(studentFilter)
    .sort(sort ? sort.split(',').join(' ') : '-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  total = await Student.countDocuments(studentFilter);
}

// Merge enrollment info (only for this year)
const enriched = students.map(s => {
  const enr = byStudent.get(s._id.toString()); // enrollment for this year only
  return {
    ...s,
    class: enr?.class || null,
    hasTransport: enr?.hasTransport || false,
    clubs: enr?.clubs || [],
    enrolled: !!enr // ✅ no carry over: only true if enrollment exists for this year
  };
});

return res.status(200).json({
  success: true,
  count: enriched.length,
  total,
  data: enriched
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
    console.log("📥 Fetching student:", req.params.id);

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
        populate: { path: 'feeType', select: 'name amount' }
      });

    if (!student) {
      console.log("❌ Student not found");
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    console.log("✅ Student found:", student._id);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    console.error("🔥 getStudent error:", err);
    next(err);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    // create empty fees for current school year
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const schoolYear = getCurrentSchoolYear(today);

    const months = currentMonth >= 9
      ? Array.from({ length: currentMonth - 8 }, (_, i) => i + 9)
      : Array.from({ length: currentMonth + 4 }, (_, i) => i + 1);

    for (const month of months) {
      await Fee.create({
        student: student._id,
        schoolYear,
        month,
        items: [{ type: 'tuition', due: 0, paid: 0 }]
      });
    }

    res.status(201).json({ success: true, data: student });
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
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: student });
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
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    await student.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
