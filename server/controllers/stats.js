const Student = require('../models/Student');
const Class = require('../models/Class');
const Club = require('../models/Club');
const Fee = require('../models/Fee');

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    const totalStudents = await Student.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalClubs = await Club.countDocuments();
    const transportUsers = await Student.countDocuments({ hasTransport: true });

    // Fetch all fees for this month
    const currentMonthFees = await Fee.find({ month: currentMonth, year: currentYear });

    let paid = 0, partial = 0, unpaid = 0, totalPaidAmount = 0;

    currentMonthFees.forEach(fee => {
      const due = fee.totalDue;
      const paidAmount = fee.totalPaid;
      totalPaidAmount += paidAmount;

      if (paidAmount >= due && due > 0) paid++;
      else if (paidAmount > 0 && paidAmount < due) partial++;
      else unpaid++;
    });

    const monthlyData = Array(12).fill(0);
    const yearlyFees = await Fee.find({ year: currentYear });

    yearlyFees.forEach(fee => {
      monthlyData[fee.month - 1] += fee.totalPaid;
    });

    const feeBreakdown = [
      { _id: 'Paid', count: paid },
      { _id: 'Partial', count: partial },
      { _id: 'Unpaid', count: unpaid }
    ];

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalClasses,
        totalClubs,
        transportUsers,
        feeStatus: {
          Paid: paid,
          Partial: partial,
          Unpaid: unpaid,
          totalPaid: totalPaidAmount
        },
        monthlyCollection: monthlyData,
        feeBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
};
