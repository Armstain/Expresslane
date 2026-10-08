const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { createAuth } = require('./middleware/auth');
const { errorHandler, notFound } = require('./lib/http');

/**
 * Build the Express app. Dependencies are passed in so tests can supply
 * a test database, a fake Firebase verifier and a fake Stripe client.
 */
const createApp = ({ config, prisma, verifyIdToken, stripe = null }) => {
  const app = express();
  const auth = createAuth({ jwtSecret: config.jwtSecret, prisma });
  const deps = { config, prisma, auth, verifyIdToken, stripe };

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/', (req, res) => res.send({ name: 'ExpressLane API', status: 'ok' }));

  app.use(require('./routes/auth')(deps));
  app.use(require('./routes/users')(deps));
  app.use(require('./routes/parcels')(deps));
  app.use(require('./routes/reviews')(deps));
  app.use(require('./routes/stats')(deps));
  app.use(require('./routes/payments')(deps));

  app.use(notFound);
  app.use(errorHandler);
  return app;
};

module.exports = { createApp };
