
exports.generateUHID = () => {
  const random = Math.floor(100000 + Math.random() * 900000);

  return `WAFCC_${random}`;
};