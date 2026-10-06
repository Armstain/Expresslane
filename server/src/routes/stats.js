const express = require('express');
const { asyncHandler } = require('../lib/http');

module.exports = ({ db, auth }) => {
  const router = express.Router();
  const { parcels, users } = db;

  // Public headline numbers for the landing page
  router.get(
    '/statistics',
    asyncHandler(async (req, res) => {
      const [totalBooked, totalDelivered, totalUsers] = await Promise.all([
        parcels.countDocuments(),
        parcels.countDocuments({ status: 'delivered' }),
        users.countDocuments(),
      ]);
      res.send({ totalBooked, totalDelivered, totalUsers });
    })
  );

  router.get(
    '/bookingsByDate',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      const result = await parcels
        .aggregate([
          // Older records stored dates as strings; skip anything unparseable instead of failing
          { $addFields: { bookedAt: { $convert: { input: '$createdDate', to: 'date', onError: null, onNull: null } } } },
          { $match: { bookedAt: { $ne: null } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookedAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray();
      res.send(result);
    })
  );

  return router;
};
