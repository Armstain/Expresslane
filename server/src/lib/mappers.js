// Translate between database rows and the JSON shapes the client already uses,
// so the frontend didn't need to change when the database moved to Postgres.

const invert = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

const ROLE_TO_DB = { user: 'customer', DeliveryMen: 'rider', admin: 'admin' };
const TYPE_TO_DB = { Regular: 'regular', Express: 'express', International: 'international' };
const STATUS_TO_DB = {
  pending: 'pending',
  'on the way': 'on_the_way',
  delivered: 'delivered',
  cancelled: 'cancelled',
};
const ROLE_TO_API = invert(ROLE_TO_DB);
const TYPE_TO_API = invert(TYPE_TO_DB);
const STATUS_TO_API = invert(STATUS_TO_DB);

const API_ROLES = Object.keys(ROLE_TO_DB);
const API_TYPES = Object.keys(TYPE_TO_DB);
const API_STATUSES = Object.keys(STATUS_TO_DB);

const dateOnly = (date) => (date ? date.toISOString().slice(0, 10) : null);
const toNumber = (decimal) => (decimal === null || decimal === undefined ? null : Number(decimal));

const toUser = (user) =>
  user && {
    _id: user.id,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoUrl,
    phoneNumber: user.phone,
    role: ROLE_TO_API[user.role],
    timestamp: user.createdAt,
  };

// Relations every parcel response needs
const parcelInclude = {
  customer: { select: { email: true } },
  review: { select: { id: true } },
  payment: { select: { paidAt: true, stripePaymentIntentId: true } },
};

const toParcel = (parcel) => ({
  _id: parcel.id,
  name: parcel.senderName,
  email: parcel.customer?.email,
  phoneNumber: parcel.senderPhone,
  parcelType: TYPE_TO_API[parcel.type],
  parcelWeight: toNumber(parcel.weightKg),
  recipientName: parcel.recipientName,
  recipientPhoneNumber: parcel.recipientPhone,
  recipientAddress: parcel.recipientAddress,
  latitude: toNumber(parcel.latitude),
  longitude: toNumber(parcel.longitude),
  deliveryDate: dateOnly(parcel.pickupDate),
  approximateDeliveryDate: dateOnly(parcel.estimatedDelivery),
  price: parcel.priceCents / 100,
  status: STATUS_TO_API[parcel.status],
  deliveryManId: parcel.riderId,
  deliveredAt: parcel.deliveredAt,
  createdDate: parcel.createdAt,
  paymentStatus: parcel.payment ? 'paid' : 'unpaid',
  paidAt: parcel.payment?.paidAt ?? null,
  transactionId: parcel.payment?.stripePaymentIntentId ?? null,
  reviewed: Boolean(parcel.review),
});

const reviewInclude = { customer: { select: { email: true, displayName: true, photoUrl: true } } };

const toReview = (review, { includeEmail = false } = {}) => ({
  _id: review.id,
  parcelId: review.parcelId,
  deliveryManId: review.riderId,
  rating: review.rating,
  feedback: review.feedback,
  reviewerName: review.customer?.displayName ?? null,
  reviewerImage: review.customer?.photoUrl ?? null,
  ...(includeEmail && { reviewerEmail: review.customer?.email }),
  reviewDate: review.createdAt,
});

const toPayment = (payment, email) => ({
  _id: payment.id,
  paymentIntentId: payment.stripePaymentIntentId,
  parcelId: payment.parcelId,
  email,
  amount: payment.amountCents / 100,
  currency: payment.currency,
  paidAt: payment.paidAt,
});

module.exports = {
  ROLE_TO_DB,
  TYPE_TO_DB,
  STATUS_TO_DB,
  API_ROLES,
  API_TYPES,
  API_STATUSES,
  toUser,
  toParcel,
  toReview,
  toPayment,
  parcelInclude,
  reviewInclude,
};
