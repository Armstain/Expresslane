require('dotenv').config();

const list = (value, fallback) =>
  (value ? value.split(',') : fallback).map((item) => item.trim()).filter(Boolean);

// MONGODB_URI is preferred; DB_USER/DB_PASS keep older deployments working
const buildMongoUri = () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (process.env.DB_USER && process.env.DB_PASS) {
    const user = encodeURIComponent(process.env.DB_USER);
    const pass = encodeURIComponent(process.env.DB_PASS);
    return `mongodb+srv://${user}:${pass}@cluster0.aakl4py.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  }
  return null;
};

const config = {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 7000,
  mongoUri: buildMongoUri(),
  dbName: process.env.DB_NAME || 'ExpressLane',
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
  if (!cfg.mongoUri) missing.push('MONGODB_URI (or DB_USER and DB_PASS)');
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
