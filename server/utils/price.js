// total_price = weight x price_per_kg, dibulatkan 2 desimal
exports.calcTotal = (weight, pricePerKg) =>
  Math.round(Number(weight) * Number(pricePerKg) * 100) / 100;

// Kolom weight di database adalah DECIMAL(5,2), maksimal 999.99
exports.validWeight = (weight) => {
  const n = Number(weight);
  return Number.isFinite(n) && n > 0 && n <= 999.99;
};