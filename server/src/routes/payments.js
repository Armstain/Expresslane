const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { toObjectId } = require('../lib/validate');

module.exports = ({ db, auth, stripe }) => {
  const router = express.Router();
  const { parcels, payments } = db;

  const requireStripe = (req, res, next) =>
    stripe ? next() : next(new HttpError(503, 'Payments are not configured'));

  const findOwnParcel = async (id, user) => {
    const parcel = await parcels.findOne({ _id: toObjectId(id, 'parcelId') });
    if (!parcel) throw new HttpError(404, 'Parcel not found');
    if (parcel.email !== user.email) throw new HttpError(403, 'Forbidden');
    return parcel;
  };

  // The amount always comes from the stored parcel, never from the request
  router.post(
    '/create-payment-intent',
    requireStripe,
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const parcel = await findOwnParcel(req.body?.parcelId, req.user);
      if (parcel.status !== 'delivered') throw new HttpError(409, 'You can pay once the parcel is delivered');
      if (parcel.paymentStatus === 'paid') throw new HttpError(409, 'This parcel is already paid');

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(parcel.price) * 100),
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: { parcelId: String(parcel._id), email: req.user.email },
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    })
  );

  // Record a payment after checking with Stripe that it really succeeded
  router.post(
    '/payments',
    requireStripe,
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const { paymentIntentId } = req.body || {};
      if (typeof paymentIntentId !== 'string' || !paymentIntentId) throw new HttpError(400, 'paymentIntentId is required');

      let intent;
      try {
        intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      } catch {
        throw new HttpError(400, 'Unknown payment');
      }
      if (intent.status !== 'succeeded') throw new HttpError(409, 'Payment has not succeeded');
      if (intent.metadata?.email !== req.user.email) throw new HttpError(403, 'Forbidden');

      const parcel = await findOwnParcel(intent.metadata.parcelId, req.user);
      if (intent.amount !== Math.round(Number(parcel.price) * 100)) {
        throw new HttpError(400, 'Payment amount does not match the parcel price');
      }

      const payment = {
        paymentIntentId: intent.id,
        parcelId: String(parcel._id),
        email: req.user.email,
        amount: intent.amount / 100,
        currency: intent.currency,
        paidAt: new Date(),
      };
      // Upsert keeps this safe to call twice for the same payment
      await payments.updateOne({ paymentIntentId: intent.id }, { $setOnInsert: payment }, { upsert: true });
      await parcels.updateOne(
        { _id: parcel._id },
        { $set: { paymentStatus: 'paid', paidAt: payment.paidAt, transactionId: intent.id } }
      );
      res.status(201).send({ success: true, payment });
    })
  );

  router.get(
    '/payments',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      res.send(await payments.find({ email: req.user.email }).sort({ paidAt: -1 }).toArray());
    })
  );

  return router;
};
