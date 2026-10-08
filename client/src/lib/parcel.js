// Shared parcel rules used by booking, listings and dashboards.

export const PARCEL_TYPES = [
  { value: "Regular", label: "Regular", description: "Delivered in about 3 days" },
  { value: "Express", label: "Express", description: "Next-day delivery" },
  { value: "International", label: "International", description: "Delivered in about 7 days" },
];

export const PARCEL_STATUSES = ["pending", "on the way", "delivered", "cancelled"];

// Flat weight tiers: up to 1kg, up to 2kg, anything heavier.
export const calculatePrice = (weight) => {
  const kg = Number(weight) || 0;
  if (kg <= 1) return 50;
  if (kg <= 2) return 100;
  return 150;
};

export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  );
