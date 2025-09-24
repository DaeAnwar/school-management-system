// controllers/fees.js
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

// Create or update a fee record
exports.upsertFee = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { schoolYear, month, items } = req.body;

    if (!schoolYear || !month || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updated = await Fee.findOneAndUpdate(
      { student: studentId, schoolYear, month },
      { student: studentId, schoolYear, month, items },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to upsert fee', error: err.message });
  }
};

// Get all fee records for a student in a school year
exports.getStudentFeesByYear = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { schoolYear } = req.query;

    const fees = await Fee.find({ student: studentId, schoolYear }).sort({ month: 1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fees', error: err.message });
  }
};

// Filter fees by month + status
exports.getFeesByMonthStatus = async (req, res) => {
  try {
    const { schoolYear, month, status } = req.query;

    const fees = await Fee.find({ schoolYear, month: +month })
      .populate({
        path: 'student',
        select: 'firstName lastName class',
        populate: { path: 'class', select: 'name' } // ✅ include class name
      });

    // optional: filter by status if your Fee model actually computes it
    const filtered = status ? fees.filter(fee => fee.status === status) : fees;
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Failed to filter fees', error: err.message });
  }
};

// Get all students with their fees for a given school year/month
// controllers/fees.js
exports.getAllStudentsFees = async (req, res) => {
  try {
    const { schoolYear, month } = req.query;

    if (!schoolYear) {
      return res.status(400).json({ message: 'schoolYear is required' });
    }

    const students = await Student.find().lean();
    const result = [];

    for (let student of students) {
      // ✅ fetch enrollment for this student + schoolYear
      const enrollment = await Enrollment.findOne({
        student: student._id,
        schoolYear
      })
        .populate('class', 'name')
        .lean();

      const fee = await Fee.findOne({
        student: student._id,
        schoolYear,
        ...(month ? { month } : {})
      }).lean();

      let totalDue = 0;
      let totalPaid = 0;
      let status = 'unpaid';

      if (fee && fee.items) {
        totalDue = fee.items.reduce((sum, i) => sum + (i.due || 0), 0);
        totalPaid = fee.items.reduce((sum, i) => sum + (i.paid || 0), 0);

        if (totalPaid >= totalDue && totalDue > 0) {
          status = 'paid';
        } else if (totalPaid > 0) {
          status = 'partial';
        } else {
          status = 'unpaid';
        }
      }

      result.push({
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          profilePhoto: student.profilePhoto,
          // ✅ now class comes from enrollment
          class: enrollment?.class
            ? { _id: enrollment.class._id, name: enrollment.class.name }
            : null
        },
        fee: fee || null,
        status,
        totalDue,
        totalPaid
      });
    }

    res.json(result);
  } catch (err) {
    console.error('❌ getAllStudentsFees failed:', err);
    res.status(500).json({ message: 'Failed to fetch all student fees', error: err.message });
  }
};
