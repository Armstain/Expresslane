const { MongoClient, ServerApiVersion } = require('mongodb');

const ensureIndexes = async ({ users, parcels, reviews, payments }) => {
  const results = await Promise.allSettled([
    users.createIndex({ email: 1 }, { unique: true }),
    parcels.createIndex({ email: 1 }),
    parcels.createIndex({ deliveryManId: 1 }),
    // One review per parcel; older reviews without a parcelId are left alone
    reviews.createIndex(
      { parcelId: 1 },
      { unique: true, partialFilterExpression: { parcelId: { $type: 'string' } } }
    ),
    reviews.createIndex({ deliveryManId: 1 }),
    payments.createIndex({ paymentIntentId: 1 }, { unique: true }),
  ]);
  // Existing duplicate data can block a unique index; keep serving and say why
  results
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.warn('Index creation skipped:', r.reason.message));
};

const connectDatabase = async (uri, dbName) => {
  const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });
  await client.connect();
  const db = client.db(dbName);
  const collections = {
    users: db.collection('users'),
    // Parcels have always lived in the "products" collection
    parcels: db.collection('products'),
    reviews: db.collection('reviews'),
    payments: db.collection('payments'),
  };
  await ensureIndexes(collections);
  return { client, db, ...collections };
};

module.exports = { connectDatabase };
