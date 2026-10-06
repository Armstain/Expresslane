// Business rules shared by the parcel routes. Mirrors client/src/lib/parcel.js.

const ROLES = ['user', 'DeliveryMen', 'admin'];
const PARCEL_TYPES = ['Regular', 'Express', 'International'];
const PARCEL_STATUSES = ['pending', 'on the way', 'delivered', 'cancelled'];
const MAX_WEIGHT_KG = 100;

// Flat weight tiers: up to 1kg, up to 2kg, anything heavier
const calculatePrice = (weight) => {
  const kg = Number(weight) || 0;
  if (kg <= 1) return 50;
  if (kg <= 2) return 100;
  return 150;
};

module.exports = { ROLES, PARCEL_TYPES, PARCEL_STATUSES, MAX_WEIGHT_KG, calculatePrice };
