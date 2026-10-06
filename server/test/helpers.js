const request = require('supertest');
const { connectDatabase } = require('../src/db');
const { createApp } = require('../src/app');

const config = {
  isProduction: false,
  jwtSecret: 'test-secret',
  sessionDays: 7,
  clientOrigins: ['http://localhost:5173'],
};

// Tokens look like "valid:<email>" so tests can sign in as anyone
const verifyIdToken = async (token) => {
  if (!token.startsWith('valid:')) throw new Error('bad token');
  return { email: token.slice('valid:'.length) };
};

// Minimal Stripe stand-in that remembers the intents it creates
const createFakeStripe = () => {
  const intents = new Map();
  let seq = 0;
  return {
    intents,
    paymentIntents: {
      create: async ({ amount, currency, metadata }) => {
        const intent = { id: `pi_${++seq}`, client_secret: `secret_${seq}`, amount, currency, metadata, status: 'requires_payment_method' };
        intents.set(intent.id, intent);
        return intent;
      },
      retrieve: async (id) => {
        if (!intents.has(id)) throw new Error('No such payment_intent');
        return intents.get(id);
      },
    },
  };
};

// Use TEST_MONGODB_URI when given (e.g. a local or CI MongoDB),
// otherwise start a throwaway in-memory server.
const startDatabase = async () => {
  let uri = process.env.TEST_MONGODB_URI;
  let memoryServer;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server-core');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }
  const dbName = `expresslane_test_${process.pid}_${Date.now()}`;
  const db = await connectDatabase(uri, dbName);
  return {
    db,
    stop: async () => {
      await db.db.dropDatabase();
      await db.client.close();
      if (memoryServer) await memoryServer.stop();
    },
  };
};

const setup = async () => {
  const { db, stop } = await startDatabase();
  const stripe = createFakeStripe();
  const app = createApp({ config, db, verifyIdToken, stripe });

  // Create a user with a role and return a supertest agent holding their session cookie
  const signIn = async (email, role = 'user', extra = {}) => {
    await db.users.updateOne(
      { email },
      { $set: { role, displayName: extra.displayName || email.split('@')[0], ...extra }, $setOnInsert: { email } },
      { upsert: true }
    );
    const agent = request.agent(app);
    await agent.post('/jwt').send({ idToken: `valid:${email}` }).expect(200);
    const user = await db.users.findOne({ email });
    return Object.assign(agent, { user });
  };

  const reset = async () => {
    await Promise.all([db.users, db.parcels, db.reviews, db.payments].map((c) => c.deleteMany({})));
    stripe.intents.clear();
  };

  return { app, db, stripe, signIn, reset, stop, request: () => request(app) };
};

const parcelBody = (overrides = {}) => ({
  phoneNumber: '01700000000',
  parcelType: 'Regular',
  parcelWeight: 1.5,
  recipientName: 'Mitu Das',
  recipientPhoneNumber: '01900000000',
  recipientAddress: 'Agrabad, Chattogram',
  deliveryDate: '2026-10-10',
  ...overrides,
});

module.exports = { setup, parcelBody };
