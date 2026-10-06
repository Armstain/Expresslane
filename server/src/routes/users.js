const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { optionalString, toObjectId } = require('../lib/validate');
const { ROLES } = require('../lib/parcel');
const { assertSelfOrAdmin } = require('../middleware/auth');

module.exports = ({ db, auth }) => {
  const router = express.Router();
  const { users, parcels, reviews } = db;

  // Create the signed-in user's profile, or update the editable fields.
  // Email comes from the session and new accounts always start as customers.
  router.put(
    '/user',
    auth.authenticate,
    asyncHandler(async (req, res) => {
      const email = req.auth.email;
      const fields = {
        displayName: optionalString(req.body?.displayName, 'displayName', 100),
        photoURL: optionalString(req.body?.photoURL, 'photoURL', 1000),
        phoneNumber: optionalString(req.body?.phoneNumber, 'phoneNumber', 30),
      };
      const updates = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));

      const user = await users.findOneAndUpdate(
        { email },
        {
          ...(Object.keys(updates).length && { $set: updates }),
          $setOnInsert: { email, role: 'user', timestamp: new Date() },
        },
        { upsert: true, returnDocument: 'after' }
      );
      res.send(user);
    })
  );

  router.get(
    '/user/:email',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const email = req.params.email.toLowerCase();
      assertSelfOrAdmin(req.user, email);
      res.send(await users.findOne({ email }));
    })
  );

  router.get(
    '/users',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      const query = req.query.role ? { role: String(req.query.role) } : {};
      res.send(await users.find(query).sort({ timestamp: -1 }).toArray());
    })
  );

  router.patch(
    '/users/update/:id',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      const _id = toObjectId(req.params.id, 'user id');
      const { role } = req.body || {};
      if (!ROLES.includes(role)) throw new HttpError(400, `Role must be one of: ${ROLES.join(', ')}`);
      if (_id.equals(req.user._id)) throw new HttpError(400, "You can't change your own role");

      const result = await users.updateOne({ _id }, { $set: { role } });
      if (!result.matchedCount) throw new HttpError(404, 'User not found');
      res.send(result);
    })
  );

  // Public leaderboard: only names, photos and performance numbers
  router.get(
    '/top-delivery-men',
    asyncHandler(async (req, res) => {
      const riders = await users
        .find({ role: 'DeliveryMen' }, { projection: { displayName: 1, photoURL: 1 } })
        .toArray();
      const ids = riders.map((r) => String(r._id));

      const [deliveries, ratings] = await Promise.all([
        parcels
          .aggregate([
            { $match: { deliveryManId: { $in: ids }, status: 'delivered' } },
            { $group: { _id: '$deliveryManId', count: { $sum: 1 } } },
          ])
          .toArray(),
        reviews
          .aggregate([
            { $match: { deliveryManId: { $in: ids } } },
            { $group: { _id: '$deliveryManId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
          ])
          .toArray(),
      ]);
      const deliveredBy = Object.fromEntries(deliveries.map((d) => [d._id, d.count]));
      const ratingOf = Object.fromEntries(ratings.map((r) => [r._id, r]));

      const ranked = riders
        .map((r) => ({
          _id: r._id,
          displayName: r.displayName || null,
          photoURL: r.photoURL || null,
          numDeliveries: deliveredBy[String(r._id)] || 0,
          averageRating: ratingOf[String(r._id)]?.average ?? null,
          reviewCount: ratingOf[String(r._id)]?.count || 0,
        }))
        .sort((a, b) => b.numDeliveries - a.numDeliveries || (b.averageRating ?? 0) - (a.averageRating ?? 0))
        .slice(0, Math.min(Number(req.query.limit) || 3, 10));

      res.send(ranked);
    })
  );

  return router;
};
