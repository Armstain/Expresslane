const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { toUuid } = require('../lib/validate');
const { toPayment } = require('../lib/mappers');

module.exports = ({ prisma, auth, stripe }) => {
  const router = express.Router();

  const requireStripe = (req, res, next) =>
    stripe ? next() : next(new HttpError(503, 'Payments are not configured'));

  const findOwnParcel = async (id, user) => {
    const parcel = await prisma.parcel.findUnique({
      where: { id: toUuid(id, 'parcelId') },
      include: { payment: true },
    });
    if (!parcel) throw new HttpError(404, 'Parcel not found');
    if (parcel.customerId !== user.id) throw new HttpError(403, 'Forbidden');
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
      if (parcel.payment) throw new HttpError(409, 'This parcel is already paid');

      const paymentIntent = await stripe.paymentIntents.create({
        amount: parcel.priceCents,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: { parcelId: parcel.id, email: req.user.email },
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
      if (intent.amount !== parcel.priceCents) {
        throw new HttpError(400, 'Payment amount does not match the parcel price');
      }

      // Upsert keeps this safe to call twice for the same payment
      const payment = await prisma.payment.upsert({
        where: { stripePaymentIntentId: intent.id },
        update: {},
        create: {
          parcelId: parcel.id,
          stripePaymentIntentId: intent.id,
          amountCents: intent.amount,
          currency: intent.currency,
        },
      });
      res.status(201).send({ success: true, payment: toPayment(payment, req.user.email) });
    })
  );

  router.get(
    '/payments',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const payments = await prisma.payment.findMany({
        where: { parcel: { customerId: req.user.id } },
        orderBy: { paidAt: 'desc' },
      });
      res.send(payments.map((p) => toPayment(p, req.user.email)));
    })
  );

  return router;
};
