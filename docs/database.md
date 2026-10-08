# Database guide: PostgreSQL, Prisma and Supabase

How ExpressLane stores its data, and the everyday workflow for changing it.

## How the pieces fit

```
server code ──► Prisma Client ──► pg driver ──► PostgreSQL (hosted on Supabase)
                     ▲
        prisma/schema.prisma ──► prisma/migrations/*.sql
```

- **PostgreSQL** is the database. Tables have real relationships (a review belongs to a parcel, a parcel belongs to a customer), and the database itself rejects bad data.
- **Supabase** hosts the Postgres database and gives you a dashboard: Table Editor, SQL Editor, backups and connection strings.
- **Prisma** is how the server talks to the database:
  - `schema.prisma` describes the tables in one readable file.
  - **Prisma Migrate** turns schema changes into versioned SQL files in `prisma/migrations/`.
  - **Prisma Client** is the generated query library used in `src/routes/*` (`prisma.parcel.findMany(...)`).

## The schema at a glance

| Table | What it holds | Key rules |
| --- | --- | --- |
| `users` | Everyone who signs in | `email` unique and lowercase; `role` is `customer`, `rider` or `admin` |
| `parcels` | Bookings | Belongs to a customer; optional rider; weight > 0; price stored in cents |
| `reviews` | Ratings for delivered parcels | One per parcel (`parcel_id` unique); rating 1–5 |
| `payments` | Stripe payments | One per parcel; a paid parcel can't be deleted |

The API still speaks the old JSON shape (`_id`, `deliveryManId`, `"on the way"`, role `"DeliveryMen"`), so the frontend didn't change. The translation lives in `src/lib/mappers.js`.

## First-time setup with Supabase

1. Create a project at [supabase.com](https://supabase.com) and save the database password.
2. Open **Connect → ORMs → Prisma** and copy the two connection strings into `server/.env`:
   - `DATABASE_URL`: the **transaction pooler** (port 6543). The running app uses this; it handles many short-lived serverless connections.
   - `DIRECT_URL`: the **session pooler or direct connection** (port 5432). Migrations use this.
3. Create the tables, then add demo data if you want it:
   ```bash
   cd server
   npm run db:deploy
   npm run db:seed
   ```
4. Open **Table Editor** in Supabase to see the data.

You can also use a local database: run Postgres in Docker and point both URLs at it.

## Everyday commands

Run these from `server/`.

| Command | When to use it |
| --- | --- |
| `npm run db:migrate -- --name <change>` | After editing `schema.prisma` in development. It creates a new migration and applies it to your dev database. |
| `npm run db:deploy` | Apply committed migrations to another database, such as production. It never creates new migrations. |
| `npm run db:generate` | Regenerate Prisma Client after a schema change. This also runs automatically on `npm install`. |
| `npm run db:seed` | Load demo users, parcels and reviews. It's safe to re-run. |
| `npm run db:studio` | Browse and edit data in a local web UI. |

## Making a schema change (example)

Say parcels need an optional delivery note:

1. Add the field to `Parcel` in `prisma/schema.prisma`:
   ```prisma
   note String? @db.VarChar(300)
   ```
2. Create and apply the migration:
   ```bash
   npm run db:migrate -- --name add_parcel_note
   ```
3. Use it in a route (`data: { note }`), expose it in `src/lib/mappers.js`, and add a test.
4. Commit `schema.prisma` **and** the new folder in `prisma/migrations/`.
5. Run `npm run db:deploy` against production when you release.

Rules of thumb:

- **Never edit a migration that has already been applied anywhere.** Add a new one instead.
- **Prisma's schema can't express CHECK constraints.** Create the migration with `--create-only`, add the SQL by hand, then apply it. The first migration does this for ratings, weights and lowercase emails.
- **Store money as integers in cents** (`price_cents`) to avoid floating-point rounding.

## Query patterns used in this codebase

```js
// Read with related data (src/routes/parcels.js)
prisma.parcel.findMany({
  where: { customer: { email } },
  include: { review: true, payment: true },
  orderBy: { createdAt: 'desc' },
});

// Create or update in one step (src/routes/users.js)
prisma.user.upsert({ where: { email }, update: changes, create: { email, ...changes } });

// Raw SQL when it's clearer than the query builder (src/routes/users.js)
prisma.$queryRaw`SELECT ... FROM users u LEFT JOIN ... WHERE u.role = 'rider' LIMIT ${limit}`;
```

`$queryRaw` with a template string is parameterised, so values like `${limit}` are sent separately from the SQL and can't be used for SQL injection.

## Learning more

- [Prisma docs](https://www.prisma.io/docs): start with *Prisma schema*, *Prisma Migrate* and *CRUD*
- [Supabase docs](https://supabase.com/docs): *Database*, *Connecting with Prisma*, then *Row Level Security* and *Realtime* as next steps
- [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html): joins, indexes and constraints
