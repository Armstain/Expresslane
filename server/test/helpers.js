const { execSync } = require('node:child_process');
const path = require('node:path');
const request = require('supertest');
const { createPrisma } = require('../src/db');
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

const testDatabaseUrl = () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('Set TEST_DATABASE_URL to a disposable Postgres database to run the tests');
  // Every test wipes all tables, so refuse anything that doesn't look like a test database
  if (!/test/i.test(new URL(url).pathname)) {
    throw new Error('TEST_DATABASE_URL must point to a database whose name contains "test"');
  }
  return url;
};

const setup = async () => {
  const url = testDatabaseUrl();
  execSync('npx prisma migrate deploy', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
    stdio: 'ignore',
  });

  const prisma = createPrisma(url);
  const stripe = createFakeStripe();
  const app = createApp({ config, prisma, verifyIdToken, stripe });

  // Create a user with a role and return a supertest agent holding their session cookie
  const signIn = async (email, role = 'customer', extra = {}) => {
    const user = await prisma.user.upsert({
      where: { email },
      update: { role, ...extra },
      create: { email, role, displayName: email.split('@')[0], ...extra },
    });
    const agent = request.agent(app);
    await agent.post('/jwt').send({ idToken: `valid:${email}` }).expect(200);
    return Object.assign(agent, { user });
  };

  const reset = async () => {
    await prisma.$executeRawUnsafe('TRUNCATE payments, reviews, parcels, users CASCADE');
    stripe.intents.clear();
  };

  return {
    app,
    prisma,
    stripe,
    signIn,
    reset,
    stop: () => prisma.$disconnect(),
    request: () => request(app),
  };
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
