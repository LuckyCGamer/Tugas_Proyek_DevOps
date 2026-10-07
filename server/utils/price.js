
exports.calcTotal = (weight, pricePerKg) =>
  Math.round(Number(weight) * Number(pricePerKg) * 100) / 100;

exports.validWeight = (weight) => {
  const n = Number(weight);
  return Number.isFinite(n) && n > 0 && n <= 999.99;
};