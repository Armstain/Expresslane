const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { optionalString, toObjectId } = require('../lib/validate');
const { isAdmin } = require('../middleware/auth');

// Fields that are safe to show on the public site (no reviewer emails)
const PUBLIC_FIELDS = {
  rating: 1,
  feedback: 1,
  deliveryManId: 1,
  parcelId: 1,
  reviewerName: 1,
  reviewerImage: 1,
  reviewDate: 1,
};

module.exports = ({ db, auth }) => {
  const router = express.Router();
  const { reviews, parcels } = db;

  router.get(
    '/reviews',
    asyncHandler(async (req, res) => {
      res.send(await reviews.find({}, { projection: PUBLIC_FIELDS }).sort({ reviewDate: -1 }).toArray());
    })
  );

  // Only the customer who booked a delivered parcel can review it, once
  router.post(
    '/reviews',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const { parcelId, rating, feedback } = req.body || {};
      const parcel = await parcels.findOne({ _id: toObjectId(parcelId, 'parcelId') });
      if (!parcel) throw new HttpError(404, 'Parcel not found');
      if (parcel.email !== req.user.email) throw new HttpError(403, 'You can only review your own parcels');
      if (parcel.status !== 'delivered') throw new HttpError(409, 'You can review a parcel once it has been delivered');
      if (!parcel.deliveryManId) throw new HttpError(409, 'This parcel has no delivery man to review');

      const stars = Number(rating);
      if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new HttpError(400, 'Rating must be 1 to 5');

      if (await reviews.findOne({ parcelId: String(parcel._id) })) {
        throw new HttpError(409, 'You have already reviewed this parcel');
      }

      const review = {
        parcelId: String(parcel._id),
        deliveryManId: parcel.deliveryManId,
        rating: stars,
        feedback: optionalString(feedback, 'feedback', 1000) || '',
        reviewerEmail: req.user.email,
        reviewerName: req.user.displayName || null,
        reviewerImage: req.user.photoURL || null,
        reviewDate: new Date(),
      };
      const result = await reviews.insertOne(review);
      await parcels.updateOne({ _id: parcel._id }, { $set: { reviewed: true } });
      res.status(201).send(result);
    })
  );

  router.get(
    '/reviews/delivery-man/:deliveryManId',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const { deliveryManId } = req.params;
      if (String(req.user._id) !== deliveryManId && !isAdmin(req.user)) throw new HttpError(403, 'Forbidden');
      res.send(await reviews.find({ deliveryManId }).sort({ reviewDate: -1 }).toArray());
    })
  );

  return router;
};
