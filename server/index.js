const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const Stripe = require('stripe');
const { config, assertConfig } = require('./src/config');
const { connectDatabase } = require('./src/db');
const { createApp } = require('./src/app');

let appPromise;

// Build the app once and reuse it (also across warm serverless invocations)
const getApp = () => {
  if (!appPromise) {
    appPromise = (async () => {
      assertConfig(config);
      const db = await connectDatabase(config.mongoUri, config.dbName);
      // Verifying ID tokens only needs the project id, not a service account
      const firebase = initializeApp({ projectId: config.firebaseProjectId });
      const verifyIdToken = (token) => getAuth(firebase).verifyIdToken(token);
      const stripe = config.stripeSecretKey ? Stripe(config.stripeSecretKey) : null;
      return createApp({ config, db, verifyIdToken, stripe });
    })().catch((err) => {
      appPromise = undefined; // let the next request retry
      throw err;
    });
  }
  return appPromise;
};

// Vercel calls the exported handler
module.exports = async (req, res) => {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('Failed to start the API:', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Server is not available' }));
  }
};

// `npm start` / `npm run dev`
if (require.main === module) {
  getApp()
    .then((app) => app.listen(config.port, () => console.log(`ExpressLane API running on port ${config.port}`)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
