require('dotenv').config();

const list = (value, fallback) =>
  (value ? value.split(',') : fallback).map((item) => item.trim()).filter(Boolean);

const config = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 7000,
  // Runtime connection (Supabase: the transaction pooler URL)
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.ACCESS_TOKEN_SECRET,
  sessionDays: Number(process.env.SESSION_DAYS) || 7,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  clientOrigins: list(process.env.CLIENT_ORIGINS, [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://expreane-c2384.web.app',
  ]),
};

// Fail fast on startup instead of on the first request
const assertConfig = (cfg = config) => {
  const missing = [];
  if (!cfg.databaseUrl) missing.push('DATABASE_URL');
  if (!cfg.jwtSecret) missing.push('ACCESS_TOKEN_SECRET');
  if (!cfg.firebaseProjectId) missing.push('FIREBASE_PROJECT_ID');
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (!cfg.stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is not set; payment routes will return 503.');
  }
};

module.exports = { config, assertConfig };
