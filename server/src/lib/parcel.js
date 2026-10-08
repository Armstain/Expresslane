// Business rules shared by the parcel routes. Mirrors client/src/lib/parcel.js.

const MAX_WEIGHT_KG = 100;

// Flat weight tiers: up to 1kg, up to 2kg, anything heavier (in cents)
const calculatePriceCents = (weight) => {
  const kg = Number(weight) || 0;
  if (kg <= 1) return 5000;
  if (kg <= 2) return 10000;
  return 15000;
};

module.exports = { MAX_WEIGHT_KG, calculatePriceCents };
