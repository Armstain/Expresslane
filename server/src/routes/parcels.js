const express = require('express');
const { HttpError, asyncHandler } = require('../lib/http');
const { optionalNumber, requiredDate, requiredString, toUuid } = require('../lib/validate');
const { MAX_WEIGHT_KG, calculatePriceCents } = require('../lib/parcel');
const { API_STATUSES, API_TYPES, STATUS_TO_DB, TYPE_TO_DB, parcelInclude, toParcel } = require('../lib/mappers');
const { assertSelfOrAdmin, isAdmin } = require('../middleware/auth');

module.exports = ({ prisma, auth }) => {
  const router = express.Router();

  const findParcel = async (id, include = parcelInclude) => {
    const parcel = await prisma.parcel.findUnique({ where: { id: toUuid(id, 'parcel id') }, include });
    if (!parcel) throw new HttpError(404, 'Parcel not found');
    return parcel;
  };

  router.get(
    '/parcels',
    auth.requireRole('admin'),
    asyncHandler(async (req, res) => {
      const parcels = await prisma.parcel.findMany({ include: parcelInclude, orderBy: { createdAt: 'desc' } });
      res.send(parcels.map(toParcel));
    })
  );

  // Book a parcel. Only known fields are stored, and the price is
  // calculated here so the client can't choose what it pays.
  router.post(
    '/parcel',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const body = req.body || {};
      if (!API_TYPES.includes(body.parcelType)) {
        throw new HttpError(400, `parcelType must be one of: ${API_TYPES.join(', ')}`);
      }
      const weightKg = optionalNumber(body.parcelWeight, 'parcelWeight', { min: 0.01, max: MAX_WEIGHT_KG });
      if (weightKg === null) throw new HttpError(400, 'parcelWeight is required');

      const parcel = await prisma.parcel.create({
        data: {
          customerId: req.user.id,
          senderName: req.user.displayName || requiredString(body.name, 'name', 100),
          senderPhone: requiredString(body.phoneNumber, 'phoneNumber', 30),
          type: TYPE_TO_DB[body.parcelType],
          weightKg,
          recipientName: requiredString(body.recipientName, 'recipientName', 100),
          recipientPhone: requiredString(body.recipientPhoneNumber, 'recipientPhoneNumber', 30),
          recipientAddress: requiredString(body.recipientAddress, 'recipientAddress', 300),
          pickupDate: requiredDate(body.deliveryDate, 'deliveryDate'),
          latitude: optionalNumber(body.latitude, 'latitude', { min: -90, max: 90 }),
          longitude: optionalNumber(body.longitude, 'longitude', { min: -180, max: 180 }),
          priceCents: calculatePriceCents(weightKg),
        },
        include: parcelInclude,
      });
      res.status(201).send(toParcel(parcel));
    })
  );

  router.get(
    '/my-parcel/:email',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const email = req.params.email.toLowerCase();
      assertSelfOrAdmin(req.user, email);
      const parcels = await prisma.parcel.findMany({
        where: { customer: { email } },
        include: parcelInclude,
        orderBy: { createdAt: 'desc' },
      });
      res.send(parcels.map(toParcel));
    })
  );

  // Customers can cancel their own parcel until a rider is on the way; admins can delete any unpaid parcel
  router.delete(
    '/my-parcel/:id',
    auth.requireUser,
    asyncHandler(async (req, res) => {
      const parcel = await findParcel(req.params.id);
      if (!isAdmin(req.user)) {
        if (parcel.customerId !== req.user.id) throw new HttpError(403, 'Forbidden');
        if (parcel.status !== 'pending') throw new HttpError(409, 'Only pending parcels can be cancelled');
      }
      if (parcel.payment) throw new HttpError(409, 'Paid parcels cannot be deleted');
      await prisma.parcel.delete({ where: { id: parcel.id } });
      res.send({ success: true });
    })
  );

  router.patch(
    '/parcel/:id',
    auth.requireRole('admin', 'rider'),
    asyncHandler(async (req, res) => {
      const parcel = await findParcel(req.params.id, null);
      const { deliveryManId, approximateDeliveryDate, status } = req.body || {};
      const data = {};

      if (isAdmin(req.user)) {
        if (deliveryManId !== undefined) {
          const rider = await prisma.user.findUnique({ where: { id: toUuid(deliveryManId, 'deliveryManId') } });
          if (rider?.role !== 'rider') throw new HttpError(400, 'deliveryManId must belong to a delivery man');
          data.riderId = rider.id;
          data.status = 'on_the_way';
        }
        if (approximateDeliveryDate !== undefined) {
          data.estimatedDelivery = requiredDate(approximateDeliveryDate, 'approximateDeliveryDate');
        }
        if (status !== undefined) {
          if (!API_STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');
          data.status = STATUS_TO_DB[status];
        }
      } else {
        // Delivery men may only close out parcels assigned to them
        if (parcel.riderId !== req.user.id) throw new HttpError(403, 'This parcel is not assigned to you');
        if (!['delivered', 'cancelled'].includes(status)) {
          throw new HttpError(400, 'Status must be delivered or cancelled');
        }
        if (['delivered', 'cancelled'].includes(parcel.status)) {
          throw new HttpError(409, `This parcel is already ${parcel.status}`);
        }
        data.status = status;
      }

      if (!Object.keys(data).length) throw new HttpError(400, 'Nothing to update');
      if (data.status === 'delivered') data.deliveredAt = new Date();

      const updated = await prisma.parcel.update({ where: { id: parcel.id }, data, include: parcelInclude });
      res.send(toParcel(updated));
    })
  );

  router.get(
    '/my-delivery/:email',
    auth.requireRole('rider', 'admin'),
    asyncHandler(async (req, res) => {
      const email = req.params.email.toLowerCase();
      assertSelfOrAdmin(req.user, email);
      const rider = email === req.user.email ? req.user : await prisma.user.findUnique({ where: { email } });
      if (rider?.role !== 'rider') throw new HttpError(404, 'Delivery man not found');
      const parcels = await prisma.parcel.findMany({
        where: { riderId: rider.id },
        include: parcelInclude,
        orderBy: { pickupDate: 'asc' },
      });
      res.send(parcels.map(toParcel));
    })
  );

  return router;
};
