const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { optionalString, toUuid } = require('../lib/validate');
const { API_ROLES, ROLE_TO_DB, toUser } = require('../lib/mappers');
const { assertSelfOrAdmin } = require('../middleware/auth');

module.exports = ({ prisma, auth }) => {
  const router = express.Router();

  // Create the signed-in user's profile, or update the editable fields.
  // Email comes from the session and new accounts always start as customers.
  router.put(
    '/user',
    auth.authenticate,
    asyncHandler(async (req, res) => {
      const email = req.auth.email;
      const fields = {
        displayName: optionalString(req.body?.displayName, 'displayName', 100),
        photoUrl: optionalString(req.body?.photoURL, 'photoURL', 1000),
        phone: optionalString(req.body?.phoneNumber, 'phoneNumber', 30),
      };
      const updates = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));

      const user = await prisma.user.upsert({
        where: { email },
        update: updates,
        create: { email, ...updates },
      });
      res.send(toUser(user));
    })
  );

  router.get(
    '/user/:email',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const email = req.params.email.toLowerCase();
      assertSelfOrAdmin(req.user, email);
      res.send(toUser(await prisma.user.findUnique({ where: { email } })) ?? null);
    })
  );

  router.get(
    '/users',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      const role = ROLE_TO_DB[req.query.role];
      const users = await prisma.user.findMany({
        where: role ? { role } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      res.send(users.map(toUser));
    })
  );

  router.patch(
    '/users/update/:id',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      const id = toUuid(req.params.id, 'user id');
      const { role } = req.body || {};
      if (!API_ROLES.includes(role)) throw new HttpError(400, `Role must be one of: ${API_ROLES.join(', ')}`);
      if (id === req.user.id) throw new HttpError(400, "You can't change your own role");

      const user = await prisma.user.update({ where: { id }, data: { role: ROLE_TO_DB[role] } });
      res.send(toUser(user));
    })
  );

  // Public leaderboard: only names, photos and performance numbers.
  // Deliveries and ratings are aggregated separately so the joins don't multiply rows.
  router.get(
    '/top-delivery-men',
    asyncHandler(async (req, res) => {
      const limit = Math.min(Math.max(Number(req.query.limit) || 3, 1), 10);
      const riders = await prisma.$queryRaw`
        WITH delivered AS (
          SELECT rider_id, COUNT(*)::int AS total
          FROM parcels WHERE status = 'delivered' GROUP BY rider_id
        ), ratings AS (
          SELECT rider_id, AVG(rating)::float AS average, COUNT(*)::int AS total
          FROM reviews GROUP BY rider_id
        )
        SELECT u.id AS "_id",
               u.display_name AS "displayName",
               u.photo_url AS "photoURL",
               COALESCE(d.total, 0) AS "numDeliveries",
               r.average AS "averageRating",
               COALESCE(r.total, 0) AS "reviewCount"
        FROM users u
        LEFT JOIN delivered d ON d.rider_id = u.id
        LEFT JOIN ratings r ON r.rider_id = u.id
        WHERE u.role = 'rider'
        ORDER BY "numDeliveries" DESC, "averageRating" DESC NULLS LAST
        LIMIT ${limit}`;
      res.send(riders);
    })
  );

  return router;
};
