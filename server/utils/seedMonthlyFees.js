const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { getCurrentSchoolYear } = require('./dateUtils');

const REQUIRED_TYPES = ['tuition', 'transport', 'club'];

const seedFeesForMonth = async (month, date = new Date()) => {
  const schoolYear = getCurrentSchoolYear(date);
  const students = await Student.find();

  for (const student of students) {
    let feeDoc = await Fee.findOne({ student: student._id, month, schoolYear });

    const baseItems = REQUIRED_TYPES.map(type => ({
      type,
      due: 0,
      paid: 0,
      date: new Date()
    }));

    // Add inscription only for September
    if (month === 9) {
      baseItems.push({
        type: 'inscription',
        due: 0,
        paid: 0,
        date: new Date()
      });
    }

    if (!feeDoc) {
      // Create entire fee document if it doesn't exist
      await Fee.create({
        student: student._id,
        schoolYear,
        month,
        items: baseItems
      });
    } else {
      // Fee exists → check for missing fee types
      const existingTypes = feeDoc.items.map(item => item.type);
      const missingItems = baseItems.filter(
        item => !existingTypes.includes(item.type)
      );

      if (missingItems.length > 0) {
        feeDoc.items.push(...missingItems);
        await feeDoc.save();
      }
    }
  }

  console.log(`✅ Fees updated or created for month ${month} / ${schoolYear}`);
};

module.exports = seedFeesForMonth;
