// Demo data: `npm run db:seed`. Safe to re-run — users are upserted and
// parcels are only created when the parcels table is empty.
//
// To sign in as these accounts, create matching users (same emails) in
// Firebase Authentication, or sign up normally and change roles as admin.

require('dotenv/config');
const { createPrisma } = require('../src/db');
const { calculatePriceCents } = require('../src/lib/parcel');

const prisma = createPrisma(process.env.DIRECT_URL || process.env.DATABASE_URL);

const USERS = [
  { email: 'admin@abc.com', displayName: 'Arif Hossain', role: 'admin', phone: '01711000002' },
  { email: 'rafi@example.com', displayName: 'Rafi Ahmed', role: 'rider', phone: '01811000003' },
  { email: 'sumaiya@example.com', displayName: 'Sumaiya Akter', role: 'rider', phone: '01811000004' },
  { email: 'tanvir@example.com', displayName: 'Tanvir Islam', role: 'rider', phone: '01811000005' },
  { email: 'nadia@example.com', displayName: 'Nadia Rahman', role: 'customer', phone: '01711000001' },
  { email: 'karim@example.com', displayName: 'Karim Uddin', role: 'customer', phone: '01711000006' },
];

const RECIPIENTS = [
  ['Farhan Kabir', 'House 12, Road 5, Dhanmondi, Dhaka', 23.7465, 90.376],
  ['Mitu Das', 'Agrabad C/A, Chattogram', 22.3285, 91.8123],
  ['Shuvo Roy', 'Zindabazar, Sylhet', 24.8949, 91.8687],
  ['Laila Begum', 'Shaheb Bazar, Rajshahi', 24.3636, 88.6241],
  ['Imran Khan', 'KDA Avenue, Khulna', 22.8166, 89.5536],
  ['Rina Paul', 'Banani, Dhaka', 23.7937, 90.4066],
];

const FEEDBACK = [
  'Arrived a day early and the rider called ahead. Brilliant service.',
  'Polite and careful with a fragile package. Will use again.',
  'Booked in the morning, tracked it all day and it arrived by evening.',
  'Smooth from start to finish — paying after delivery is a great touch.',
];

const TYPES = ['regular', 'express', 'international'];
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const dateOnly = (d) => new Date(d.toISOString().slice(0, 10));

async function main() {
  const users = {};
  for (const user of USERS) {
    users[user.email] = await prisma.user.upsert({ where: { email: user.email }, update: user, create: user });
  }

  if ((await prisma.parcel.count()) > 0) {
    console.log('Parcels already exist; seeded users only.');
    return;
  }

  const customers = [users['nadia@example.com'], users['karim@example.com']];
  const riders = [users['rafi@example.com'], users['sumaiya@example.com'], users['tanvir@example.com']];

  // Two weeks of bookings with a realistic mix of statuses
  for (let i = 0; i < 18; i++) {
    const customer = customers[i % customers.length];
    const [recipientName, recipientAddress, latitude, longitude] = RECIPIENTS[i % RECIPIENTS.length];
    const age = 14 - Math.floor(i * 0.75);
    const status = age > 6 ? 'delivered' : age > 3 ? (i % 4 === 0 ? 'cancelled' : 'on_the_way') : 'pending';
    const rider = status === 'pending' ? null : riders[i % riders.length];
    const weightKg = [0.8, 1.5, 3.2, 1.1][i % 4];
    const pickup = daysAgo(age - 1);

    const parcel = await prisma.parcel.create({
      data: {
        customerId: customer.id,
        senderName: customer.displayName,
        senderPhone: customer.phone,
        type: TYPES[i % TYPES.length],
        weightKg,
        recipientName,
        recipientPhone: `0191200${String(i).padStart(4, '0')}`,
        recipientAddress,
        latitude,
        longitude,
        pickupDate: dateOnly(pickup),
        estimatedDelivery: rider ? dateOnly(daysAgo(age - 3)) : null,
        priceCents: calculatePriceCents(weightKg),
        status,
        riderId: rider?.id ?? null,
        deliveredAt: status === 'delivered' ? daysAgo(age - 2) : null,
        createdAt: daysAgo(age),
      },
    });

    if (status === 'delivered') {
      await prisma.review.create({
        data: {
          parcelId: parcel.id,
          riderId: rider.id,
          customerId: customer.id,
          rating: [5, 4, 5, 3, 5][i % 5],
          feedback: FEEDBACK[i % FEEDBACK.length],
          createdAt: daysAgo(age - 3),
        },
      });
      if (i % 2 === 0) {
        await prisma.payment.create({
          data: {
            parcelId: parcel.id,
            stripePaymentIntentId: `pi_demo_${i}`,
            amountCents: parcel.priceCents,
            paidAt: daysAgo(age - 3),
          },
        });
      }
    }
  }

  const counts = await Promise.all([prisma.user.count(), prisma.parcel.count(), prisma.review.count(), prisma.payment.count()]);
  console.log(`Seeded ${counts[0]} users, ${counts[1]} parcels, ${counts[2]} reviews, ${counts[3]} payments.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
