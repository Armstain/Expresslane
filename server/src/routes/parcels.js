const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { optionalNumber, requiredDate, requiredString, toObjectId } = require('../lib/validate');
const { MAX_WEIGHT_KG, PARCEL_STATUSES, PARCEL_TYPES, calculatePrice } = require('../lib/parcel');
const { assertSelfOrAdmin, isAdmin } = require('../middleware/auth');

module.exports = ({ db, auth }) => {
  const router = express.Router();
  const { parcels, users } = db;

  const findParcel = async (id) => {
    const parcel = await parcels.findOne({ _id: toObjectId(id, 'parcel id') });
    if (!parcel) throw new HttpError(404, 'Parcel not found');
    return parcel;
  };

  router.get(
    '/parcels',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      res.send(await parcels.find().sort({ createdDate: -1 }).toArray());
    })
  );

  // Book a parcel. Only whitelisted fields are stored, and the price is
  // calculated here so the client can't choose what it pays.
  router.post(
    '/parcel',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const body = req.body || {};
      if (!PARCEL_TYPES.includes(body.parcelType)) {
        throw new HttpError(400, `parcelType must be one of: ${PARCEL_TYPES.join(', ')}`);
      }
      const parcelWeight = optionalNumber(body.parcelWeight, 'parcelWeight', { min: 0.01, max: MAX_WEIGHT_KG });
      if (parcelWeight === null) throw new HttpError(400, 'parcelWeight is required');

      const parcel = {
        name: req.user.displayName || requiredString(body.name, 'name', 100),
        email: req.user.email,
        phoneNumber: requiredString(body.phoneNumber, 'phoneNumber', 30),
        parcelType: body.parcelType,
        parcelWeight,
        recipientName: requiredString(body.recipientName, 'recipientName', 100),
        recipientPhoneNumber: requiredString(body.recipientPhoneNumber, 'recipientPhoneNumber', 30),
        recipientAddress: requiredString(body.recipientAddress, 'recipientAddress', 300),
        deliveryDate: requiredDate(body.deliveryDate, 'deliveryDate'),
        latitude: optionalNumber(body.latitude, 'latitude', { min: -90, max: 90 }),
        longitude: optionalNumber(body.longitude, 'longitude', { min: -180, max: 180 }),
        price: calculatePrice(parcelWeight),
        status: 'pending',
        createdDate: new Date(),
      };

      const result = await parcels.insertOne(parcel);
      res.status(201).send({ ...result, parcel: { _id: result.insertedId, ...parcel } });
    })
  );

  router.get(
    '/my-parcel/:email',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const email = req.params.email.toLowerCase();
      assertSelfOrAdmin(req.user, email);
      res.send(await parcels.find({ email }).sort({ createdDate: -1 }).toArray());
    })
  );

  // Customers can cancel their own parcel until a rider is on the way; admins can delete any
  router.delete(
    '/my-parcel/:id',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const parcel = await findParcel(req.params.id);
      if (!isAdmin(req.user)) {
        if (parcel.email !== req.user.email) throw new HttpError(403, 'Forbidden');
        if (parcel.status !== 'pending') throw new HttpError(409, 'Only pending parcels can be cancelled');
      }
      res.send(await parcels.deleteOne({ _id: parcel._id }));
    })
  );

  router.patch(
    '/parcel/:id',
    auth.requireRole('admin', 'DeliveryMen'),
    asyncHandler(async (req, res) => {
      const parcel = await findParcel(req.params.id);
      const { deliveryManId, approximateDeliveryDate, status } = req.body || {};
      const updates = {};

      if (isAdmin(req.user)) {
        if (deliveryManId !== undefined) {
          const rider = await users.findOne({ _id: toObjectId(deliveryManId, 'deliveryManId') });
          if (rider?.role !== 'DeliveryMen') throw new HttpError(400, 'deliveryManId must belong to a delivery man');
          updates.deliveryManId = String(rider._id);
          updates.status = 'on the way';
        }
        if (approximateDeliveryDate !== undefined) {
          updates.approximateDeliveryDate = requiredDate(approximateDeliveryDate, 'approximateDeliveryDate');
        }
        if (status !== undefined) {
          if (!PARCEL_STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');
          updates.status = status;
        }
      } else {
        // Delivery men may only close out parcels assigned to them
        if (parcel.deliveryManId !== String(req.user._id)) throw new HttpError(403, 'This parcel is not assigned to you');
        if (!['delivered', 'cancelled'].includes(status)) {
          throw new HttpError(400, 'Status must be delivered or cancelled');
        }
        if (['delivered', 'cancelled'].includes(parcel.status)) {
          throw new HttpError(409, `This parcel is already ${parcel.status}`);
        }
        updates.status = status;
      }

      if (!Object.keys(updates).length) throw new HttpError(400, 'Nothing to update');
      if (updates.status === 'delivered') updates.deliveredAt = new Date();

      res.send(await parcels.updateOne({ _id: parcel._id }, { $set: updates }));
    })
  );

  router.get(
    '/my-delivery/:email',
    auth.requireRole('DeliveryMen', 'admin'),
    asyncHandler(async (req, res) => {
      const email = req.params.email.toLowerCase();
      assertSelfOrAdmin(req.user, email);
      const rider = email === req.user.email ? req.user : await users.findOne({ email, role: 'DeliveryMen' });
      if (!rider) throw new HttpError(404, 'Delivery man not found');
      res.send(await parcels.find({ deliveryManId: String(rider._id) }).sort({ deliveryDate: 1 }).toArray());
    })
  );

  return router;
};
