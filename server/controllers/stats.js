// controllers/stats.js
const Student = require('../models/Student');
const ClassModel = require('../models/Class');
const Club = require('../models/Club');
const Enrollment = require('../models/Enrollment');
const Fee = require('../models/Fee');
const { getCurrentSchoolYear } = require('../utils/dateUtils');

exports.getDashboardStats = async (req, res) => {
  try {
    const schoolYear = req.query.schoolYear || getCurrentSchoolYear();

    // 1. Total counts
    const totalStudents = await Student.countDocuments();
    const totalClasses = await ClassModel.countDocuments();
    const totalClubs = await Club.countDocuments();

    // 2. Transport users in this school year
    const transportUsers = await Enrollment.countDocuments({
      schoolYear,
      hasTransport: true,
    });

    // 3. Fee status breakdown
    const fees = await Fee.find({ schoolYear }).lean();

    let Paid = 0;
    let Partial = 0;
    let Unpaid = 0;
    let totalPaid = 0;

    for (let fee of fees) {
      const due = fee.items.reduce((s, i) => s + (i.due || 0), 0);
      const paid = fee.items.reduce((s, i) => s + (i.paid || 0), 0);

      totalPaid += paid;

      if (paid >= due && due > 0) Paid++;
      else if (paid > 0 && paid < due) Partial++;
      else Unpaid++;
    }

    // 4. Monthly collection
    const monthlyCollection = Array(12).fill(0);
    fees.forEach(fee => {
      const paid = fee.items.reduce((s, i) => s + (i.paid || 0), 0);
      if (fee.month >= 1 && fee.month <= 12) {
        monthlyCollection[fee.month - 1] += paid;
      }
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalClasses,
        totalClubs,
        transportUsers,
        feeStatus: { Paid, Partial, Unpaid, totalPaid },
        monthlyCollection,
        feeBreakdown: [
          { _id: 'Paid', count: Paid },
          { _id: 'Partial', count: Partial },
          { _id: 'Unpaid', count: Unpaid },
        ],
      },
    });
  } catch (err) {
    console.error('❌ Dashboard stats failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
