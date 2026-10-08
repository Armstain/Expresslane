const jwt = require('jsonwebtoken');
const { HttpError, asyncHandler } = require('../lib/http');

const createAuth = ({ jwtSecret, prisma }) => {
  // Valid session cookie → req.auth = { email }
  const authenticate = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return next(new HttpError(401, 'Unauthorized'));
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err || !decoded?.email) return next(new HttpError(401, 'Unauthorized'));
      req.auth = { email: decoded.email };
      next();
    });
  };

  // Attach the database user; roles always come from the database, never the token
  const loadUser = asyncHandler(async (req, res, next) => {
    const user = await prisma.user.findUnique({ where: { email: req.auth.email } });
    if (!user) throw new HttpError(403, 'Account not found');
    req.user = user;
    next();
  });

  const requireUser = [authenticate, loadUser];

  // Roles use database names: 'customer', 'rider', 'admin'
  const requireRole = (...roles) => [
    ...requireUser,
    (req, res, next) =>
      roles.includes(req.user.role) ? next() : next(new HttpError(403, 'Forbidden')),
  ];

  return { authenticate, requireUser, requireRole };
};

const isAdmin = (user) => user?.role === 'admin';

// Allow a user to act on their own records, or any record if they're an admin
const assertSelfOrAdmin = (user, email) => {
  if (user.email !== email && !isAdmin(user)) throw new HttpError(403, 'Forbidden');
};

module.exports = { createAuth, isAdmin, assertSelfOrAdmin };
