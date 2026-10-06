const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { setup, parcelBody } = require('./helpers');

let t;
before(async () => {
  t = await setup();
});
after(async () => {
  await t.stop();
});
beforeEach(async () => {
  await t.reset();
});

// Book a parcel as `customer`, optionally assign it to `rider` and set a status
const bookParcel = async (customer, { rider, status } = {}) => {
  const res = await customer.post('/parcel').send(parcelBody()).expect(201);
  const _id = res.body.insertedId;
  const updates = {};
  if (rider) updates.deliveryManId = String(rider.user._id);
  if (status) updates.status = status;
  if (Object.keys(updates).length) {
    const { ObjectId } = require('mongodb');
    await t.db.parcels.updateOne({ _id: new ObjectId(_id) }, { $set: updates });
  }
  return _id;
};

describe('auth', () => {
  it('rejects an invalid Firebase token', async () => {
    await t.request().post('/jwt').send({ idToken: 'forged' }).expect(401);
  });

  it('requires an idToken', async () => {
    await t.request().post('/jwt').send({ email: 'admin@abc.com' }).expect(400);
  });

  it('sets an httpOnly session cookie for a valid token', async () => {
    const res = await t.request().post('/jwt').send({ idToken: 'valid:nadia@example.com' }).expect(200);
    const cookie = res.headers['set-cookie'][0];
    assert.match(cookie, /^token=/);
    assert.match(cookie, /HttpOnly/);
  });

  it('returns 401 without a session', async () => {
    await t.request().get('/parcels').expect(401);
  });

  it('returns JSON for unknown routes and malformed bodies', async () => {
    const missing = await t.request().get('/nope').expect(404);
    assert.match(missing.body.message, /Not found/);
    await t.request().post('/jwt').set('Content-Type', 'application/json').send('{bad').expect(400);
  });
});

describe('users', () => {
  it('creates new accounts as customers even if a role is sent', async () => {
    const agent = require('supertest').agent(t.app);
    await agent.post('/jwt').send({ idToken: 'valid:new@example.com' }).expect(200);
    const res = await agent.put('/user').send({ displayName: 'New', role: 'admin', email: 'other@example.com' }).expect(200);
    assert.equal(res.body.role, 'user');
    assert.equal(res.body.email, 'new@example.com');
  });

  it('only lets admins list users', async () => {
    const customer = await t.signIn('nadia@example.com');
    const admin = await t.signIn('admin@abc.com', 'admin');
    await customer.get('/users').expect(403);
    const res = await admin.get('/users').expect(200);
    assert.equal(res.body.length, 2);
  });

  it("hides other people's profiles", async () => {
    const customer = await t.signIn('nadia@example.com');
    await t.signIn('karim@example.com');
    await customer.get('/user/nadia@example.com').expect(200);
    await customer.get('/user/karim@example.com').expect(403);
  });

  it('only lets admins change roles, to valid roles', async () => {
    const customer = await t.signIn('nadia@example.com');
    const admin = await t.signIn('admin@abc.com', 'admin');
    const id = String(customer.user._id);
    await customer.patch(`/users/update/${id}`).send({ role: 'admin' }).expect(403);
    await admin.patch(`/users/update/${id}`).send({ role: 'superuser' }).expect(400);
    await admin.patch('/users/update/not-an-id').send({ role: 'admin' }).expect(400);
    await admin.patch(`/users/update/${String(admin.user._id)}`).send({ role: 'user' }).expect(400);
    await admin.patch(`/users/update/${id}`).send({ role: 'DeliveryMen' }).expect(200);
    assert.equal((await t.db.users.findOne({ _id: customer.user._id })).role, 'DeliveryMen');
  });

  it('publishes a top delivery men list without private fields', async () => {
    const customer = await t.signIn('nadia@example.com');
    const rider = await t.signIn('rafi@example.com', 'DeliveryMen', { phoneNumber: '018' });
    await bookParcel(customer, { rider, status: 'delivered' });
    const res = await t.request().get('/top-delivery-men').expect(200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].numDeliveries, 1);
    assert.equal(res.body[0].email, undefined);
    assert.equal(res.body[0].phoneNumber, undefined);
  });
});

describe('parcels', () => {
  it('stores the booking with a server-calculated price and the session email', async () => {
    const customer = await t.signIn('nadia@example.com');
    await customer
      .post('/parcel')
      .send(parcelBody({ price: 1, email: 'someone@else.com', status: 'delivered', parcelWeight: 1.5 }))
      .expect(201);
    const parcel = await t.db.parcels.findOne({});
    assert.equal(parcel.price, 100);
    assert.equal(parcel.email, 'nadia@example.com');
    assert.equal(parcel.status, 'pending');
  });

  it('validates the booking', async () => {
    const customer = await t.signIn('nadia@example.com');
    await customer.post('/parcel').send(parcelBody({ parcelType: 'Teleport' })).expect(400);
    await customer.post('/parcel').send(parcelBody({ parcelWeight: -1 })).expect(400);
    await customer.post('/parcel').send(parcelBody({ recipientAddress: '' })).expect(400);
    await customer.post('/parcel').send(parcelBody({ latitude: 200 })).expect(400);
  });

  it("keeps customers out of other people's parcels", async () => {
    const nadia = await t.signIn('nadia@example.com');
    const karim = await t.signIn('karim@example.com');
    const id = await bookParcel(nadia);
    await karim.get('/my-parcel/nadia@example.com').expect(403);
    await karim.delete(`/my-parcel/${id}`).expect(403);
    await karim.get('/parcels').expect(403);
  });

  it('lets customers cancel only pending parcels', async () => {
    const nadia = await t.signIn('nadia@example.com');
    const rider = await t.signIn('rafi@example.com', 'DeliveryMen');
    const pending = await bookParcel(nadia);
    const moving = await bookParcel(nadia, { rider, status: 'on the way' });
    await nadia.delete(`/my-parcel/${moving}`).expect(409);
    await nadia.delete(`/my-parcel/${pending}`).expect(200);
  });

  it('only assigns parcels to delivery men', async () => {
    const nadia = await t.signIn('nadia@example.com');
    const admin = await t.signIn('admin@abc.com', 'admin');
    const rider = await t.signIn('rafi@example.com', 'DeliveryMen');
    const id = await bookParcel(nadia);
    await nadia.patch(`/parcel/${id}`).send({ status: 'delivered' }).expect(403);
    await admin.patch(`/parcel/${id}`).send({ deliveryManId: String(nadia.user._id) }).expect(400);
    await admin
      .patch(`/parcel/${id}`)
      .send({ deliveryManId: String(rider.user._id), approximateDeliveryDate: '2026-10-12' })
      .expect(200);
    const parcel = await t.db.parcels.findOne({});
    assert.equal(parcel.status, 'on the way');
    assert.equal(parcel.deliveryManId, String(rider.user._id));
  });

  it('lets a delivery man close out only their own parcels', async () => {
    const nadia = await t.signIn('nadia@example.com');
    const rafi = await t.signIn('rafi@example.com', 'DeliveryMen');
    const sumi = await t.signIn('sumi@example.com', 'DeliveryMen');
    const id = await bookParcel(nadia, { rider: rafi, status: 'on the way' });
    await sumi.patch(`/parcel/${id}`).send({ status: 'delivered' }).expect(403);
    await rafi.patch(`/parcel/${id}`).send({ status: 'pending' }).expect(400);
    await rafi.patch(`/parcel/${id}`).send({ status: 'delivered' }).expect(200);
    await rafi.patch(`/parcel/${id}`).send({ status: 'cancelled' }).expect(409);
    const list = await rafi.get('/my-delivery/rafi@example.com').expect(200);
    assert.equal(list.body.length, 1);
    await rafi.get('/my-delivery/sumi@example.com').expect(403);
  });
});

describe('reviews', () => {
  it('accepts one review per delivered parcel from its owner', async () => {
    const nadia = await t.signIn('nadia@example.com');
    const karim = await t.signIn('karim@example.com');
    const rafi = await t.signIn('rafi@example.com', 'DeliveryMen');
    const id = await bookParcel(nadia, { rider: rafi, status: 'on the way' });

    await nadia.post('/reviews').send({ parcelId: id, rating: 5 }).expect(409);
    await t.db.parcels.updateOne({}, { $set: { status: 'delivered' } });
    await karim.post('/reviews').send({ parcelId: id, rating: 5 }).expect(403);
    await nadia.post('/reviews').send({ parcelId: id, rating: 9 }).expect(400);
    await nadia
      .post('/reviews')
      .send({ parcelId: id, rating: 5, feedback: 'Great', deliveryManId: 'someone-else' })
      .expect(201);
    await nadia.post('/reviews').send({ parcelId: id, rating: 4 }).expect(409);

    const review = await t.db.reviews.findOne({});
    assert.equal(review.deliveryManId, String(rafi.user._id));
    assert.equal((await t.db.parcels.findOne({})).reviewed, true);
  });

  it('never exposes reviewer emails publicly', async () => {
    await t.db.reviews.insertOne({ rating: 5, reviewerEmail: 'secret@example.com', reviewerName: 'N' });
    const res = await t.request().get('/reviews').expect(200);
    assert.equal(res.body[0].reviewerEmail, undefined);
  });

  it("limits a delivery man's review list to themselves and admins", async () => {
    const rafi = await t.signIn('rafi@example.com', 'DeliveryMen');
    const sumi = await t.signIn('sumi@example.com', 'DeliveryMen');
    const admin = await t.signIn('admin@abc.com', 'admin');
    await rafi.get(`/reviews/delivery-man/${rafi.user._id}`).expect(200);
    await admin.get(`/reviews/delivery-man/${rafi.user._id}`).expect(200);
    await sumi.get(`/reviews/delivery-man/${rafi.user._id}`).expect(403);
  });
});

describe('payments', () => {
  it('charges the stored parcel price and records verified payments', async () => {
    const nadia = await t.signIn('nadia@example.com');
    const karim = await t.signIn('karim@example.com');
    const rafi = await t.signIn('rafi@example.com', 'DeliveryMen');
    const id = await bookParcel(nadia, { rider: rafi, status: 'on the way' });

    await nadia.post('/create-payment-intent').send({ parcelId: id }).expect(409);
    await t.db.parcels.updateOne({}, { $set: { status: 'delivered' } });
    await karim.post('/create-payment-intent').send({ parcelId: id }).expect(403);
    await nadia.post('/create-payment-intent').send({ parcelId: id, price: 1 }).expect(200);

    const [intent] = [...t.stripe.intents.values()];
    assert.equal(intent.amount, 10000);

    await nadia.post('/payments').send({ paymentIntentId: intent.id }).expect(409);
    intent.status = 'succeeded';
    await karim.post('/payments').send({ paymentIntentId: intent.id }).expect(403);
    await nadia.post('/payments').send({ paymentIntentId: intent.id }).expect(201);
    await nadia.post('/payments').send({ paymentIntentId: intent.id }).expect(201);

    assert.equal(await t.db.payments.countDocuments(), 1);
    assert.equal((await t.db.parcels.findOne({})).paymentStatus, 'paid');
    await nadia.post('/create-payment-intent').send({ parcelId: id }).expect(409);
  });
});

describe('statistics', () => {
  it('keeps headline numbers public and booking history admin-only', async () => {
    const nadia = await t.signIn('nadia@example.com');
    const admin = await t.signIn('admin@abc.com', 'admin');
    await bookParcel(nadia);
    await t.db.parcels.insertOne({ createdDate: 'not a date', status: 'pending' });

    const stats = await t.request().get('/statistics').expect(200);
    assert.deepEqual(stats.body, { totalBooked: 2, totalDelivered: 0, totalUsers: 2 });

    await nadia.get('/bookingsByDate').expect(403);
    const byDate = await admin.get('/bookingsByDate').expect(200);
    assert.equal(byDate.body.length, 1);
    assert.equal(byDate.body[0].count, 1);
  });
});
