const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { optionalString, toUuid } = require('../lib/validate');
const { reviewInclude, toReview } = require('../lib/mappers');
const { isAdmin } = require('../middleware/auth');

module.exports = ({ prisma, auth }) => {
  const router = express.Router();

  // Public list for the landing page: reviewer emails are never included
  router.get(
    '/reviews',
    asyncHandler(async (req, res) => {
      const reviews = await prisma.review.findMany({ include: reviewInclude, orderBy: { createdAt: 'desc' } });
      res.send(reviews.map((r) => toReview(r)));
    })
  );

  // Only the customer who booked a delivered parcel can review it, once
  router.post(
    '/reviews',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const { parcelId, rating, feedback } = req.body || {};
      const parcel = await prisma.parcel.findUnique({
        where: { id: toUuid(parcelId, 'parcelId') },
        include: { review: { select: { id: true } } },
      });
      if (!parcel) throw new HttpError(404, 'Parcel not found');
      if (parcel.customerId !== req.user.id) throw new HttpError(403, 'You can only review your own parcels');
      if (parcel.status !== 'delivered') throw new HttpError(409, 'You can review a parcel once it has been delivered');
      if (!parcel.riderId) throw new HttpError(409, 'This parcel has no delivery man to review');

      const stars = Number(rating);
      if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new HttpError(400, 'Rating must be 1 to 5');
      if (parcel.review) throw new HttpError(409, 'You have already reviewed this parcel');

      const review = await prisma.review.create({
        data: {
          parcelId: parcel.id,
          riderId: parcel.riderId,
          customerId: req.user.id,
          rating: stars,
          feedback: optionalString(feedback, 'feedback', 1000) || '',
        },
        include: reviewInclude,
      });
      res.status(201).send(toReview(review));
    })
  );

  router.get(
    '/reviews/delivery-man/:deliveryManId',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const riderId = toUuid(req.params.deliveryManId, 'deliveryManId');
      if (riderId !== req.user.id && !isAdmin(req.user)) throw new HttpError(403, 'Forbidden');
      const reviews = await prisma.review.findMany({
        where: { riderId },
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
      });
      res.send(reviews.map((r) => toReview(r, { includeEmail: true })));
    })
  );

  return router;
};
