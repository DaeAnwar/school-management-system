exports.getCurrentSchoolYear = function (date = new Date()) {
  const year = date.getFullYear();
  return date.getMonth() >= 8 // Sept or later
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
};