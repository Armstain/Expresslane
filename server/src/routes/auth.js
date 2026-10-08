const express = require('express');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { HttpError, asyncHandler } = require('../lib/http');

module.exports = ({ config, verifyIdToken }) => {
  const router = express.Router();

  const cookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
  };

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many sign-in attempts, please try again later' },
  });

  // Exchange a Firebase ID token for our session cookie.
  // The email comes from the verified token, so callers can't claim someone else's account.
  router.post(
    '/jwt',
    loginLimiter,
    asyncHandler(async (req, res) => {
      const { idToken } = req.body || {};
      if (typeof idToken !== 'string' || !idToken) throw new HttpError(400, 'idToken is required');

      let decoded;
      try {
        decoded = await verifyIdToken(idToken);
      } catch {
        throw new HttpError(401, 'Invalid or expired sign-in token');
      }
      if (!decoded?.email) throw new HttpError(401, 'Your account has no email address');

      const token = jwt.sign({ email: decoded.email.toLowerCase() }, config.jwtSecret, {
        expiresIn: `${config.sessionDays}d`,
      });
      res
        .cookie('token', token, { ...cookieOptions, maxAge: config.sessionDays * 24 * 60 * 60 * 1000 })
        .send({ success: true });
    })
  );

  router.get('/logout', (req, res) => {
    res.clearCookie('token', cookieOptions).send({ success: true });
  });

  return router;
};
