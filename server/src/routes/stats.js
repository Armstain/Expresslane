const express = require('express');
const { asyncHandler } = require('../lib/http');

module.exports = ({ prisma, auth }) => {
  const router = express.Router();

  // Public headline numbers for the landing page
  router.get(
    '/statistics',
    asyncHandler(async (req, res) => {
      const [totalBooked, totalDelivered, totalUsers] = await Promise.all([
        prisma.parcel.count(),
        prisma.parcel.count({ where: { status: 'delivered' } }),
        prisma.user.count(),
      ]);
      res.send({ totalBooked, totalDelivered, totalUsers });
    })
  );

  router.get(
    '/bookingsByDate',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      const rows = await prisma.$queryRaw`
        SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS "_id", COUNT(*)::int AS count
        FROM parcels
        GROUP BY 1
        ORDER BY 1`;
      res.send(rows);
    })
  );

  return router;
};
