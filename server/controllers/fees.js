const Fee = require('../models/Fee');
const Student = require('../models/Student');

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

// Filter fees by month + status (e.g., "unpaid" for September)
exports.getFeesByMonthStatus = async (req, res) => {
  try {
    const { schoolYear, month, status } = req.query;

    const fees = await Fee.find({ schoolYear, month: +month })
      .populate('student', 'firstName lastName class');

    const filtered = fees.filter(fee => fee.status === status);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Failed to filter fees', error: err.message });
  }
};

// Get all unpaid/partial/paid students for a month
exports.getAllStudentsFees = async (req, res) => {
  try {
    const { schoolYear, month } = req.query;
    const students = await Student.find();
    const result = [];

    for (let student of students) {
      const fee = await Fee.findOne({ student: student._id, schoolYear, month });

      result.push({
        student,
        fee: fee || null,
        status: fee ? fee.status : 'unpaid',
        totalDue: fee ? fee.totalDue : 0,
        totalPaid: fee ? fee.totalPaid : 0
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all student fees', error: err.message });
  }
};
