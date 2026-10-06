<div align="center">

# ExpressLane

**Parcel delivery, simplified.** Book a pickup in under a minute, follow every step of the journey, and pay once it arrives.

[Live demo](https://expreane-c2384.web.app/) · [Features](#features) · [Screenshots](#screenshots) · [Getting started](#getting-started)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-payments-635BFF?logo=stripe&logoColor=white)

![ExpressLane landing page](docs/screenshots/landing-light.png)

</div>

## Features

ExpressLane is a full-stack delivery platform with three roles, each with its own dashboard.

### Customers
- **Book in a minute** — sender, recipient and parcel details with a live price and arrival estimate as you type
- **Track every step** — a timeline from *Booked* → *Rider assigned* → *On the way* → *Delivered*
- **Overview dashboard** — active shipment, recent parcels and delivery stats at a glance
- **Pay after delivery** — card payments through Stripe, only once the parcel has arrived
- **Rate the rider** — star ratings and written feedback for every delivered parcel

### Delivery partners
- **Assigned deliveries** with one-tap call links for sender and recipient
- **Map view** of the drop-off location (Leaflet + OpenStreetMap)
- **Mark delivered or cancelled** with confirmation dialogs
- **Reviews page** with average rating and star distribution

### Admins
- **Statistics** — KPI tiles plus bookings-per-day and booked-vs-delivered charts, each with a table view
- **Parcel management** — status filters, rider assignment with an editable delivery date
- **User management** — search, parcel counts and role changes
- **Delivery team** — assigned vs. delivered counts and average ratings per rider

### Across the app
- Light and dark themes that follow the system setting, with no flash on load
- Fully responsive — customer and rider lists become cards on phones, the sidebar becomes a drawer
- Role-aware routing: `/dashboard` sends each role to its own home page
- Route-level code splitting keeps the landing page bundle small
- Accessible by default: keyboard-friendly dialogs, visible focus states, reduced-motion support and chart colours checked for colour-blind separation

## Screenshots

| Customer overview | Parcel tracking |
| --- | --- |
| ![Customer overview](docs/screenshots/customer-overview.png) | ![Parcel tracking panel](docs/screenshots/parcel-tracking.png) |
| **Book a parcel** | **Admin statistics (dark)** |
| ![Book a parcel](docs/screenshots/book-parcel.png) | ![Admin statistics in dark mode](docs/screenshots/admin-statistics-dark.png) |
| **Parcel management** | **Sign in** |
| ![Admin parcel management](docs/screenshots/admin-parcels.png) | ![Sign in page](docs/screenshots/login.png) |

<p align="center"><img src="docs/screenshots/mobile.png" alt="ExpressLane on mobile" width="820"></p>

<details>
<summary>Landing page in dark mode</summary>

![Landing page in dark mode](docs/screenshots/landing-dark.png)

</details>

## Tech stack

| Layer | Tools |
| --- | --- |
| Front end | React 18, Vite, React Router 6, TanStack Query, Tailwind CSS, shadcn/ui (Radix UI), Lucide icons |
| Charts & maps | ApexCharts, Leaflet / React Leaflet |
| Auth | Firebase Authentication (email + Google) with an HTTP-only JWT cookie for the API |
| Payments | Stripe Payment Intents + Stripe Elements |
| Back end | Node.js, Express, MongoDB |
| Hosting | Firebase Hosting (client), Vercel (API) |

## Project structure

```
client/
  src/
    api/            axios instances and helpers (dates, image upload)
    components/
      ui/           shadcn/ui primitives (button, dialog, sheet, table…)
      Shared/       app-wide building blocks (Logo, PageHeader, StatusBadge…)
      Parcel/       tracking timeline and parcel detail panel
      Dashboard/    sidebar and admin screens
    layouts/        public site and dashboard shells
    pages/          route-level pages (lazy-loaded where possible)
    routes/         router, auth guard and role guard
    lib/            shared parcel rules (pricing, statuses)
server/
  index.js          Express API
docs/screenshots/   images used in this README
```

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB database, a Firebase project with Email/Password and Google sign-in enabled, and a Stripe account in test mode.

### 1. API

```bash
cd server
npm install
```

Create `server/.env`:

```env
DB_USER=your-mongodb-user
DB_PASS=your-mongodb-password
ACCESS_TOKEN_SECRET=a-long-random-string
STRIPE_SECRET_KEY=sk_test_...
```

```bash
npm run dev        # http://localhost:7000
```

### 2. Client

```bash
cd client
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:5173
```

### Roles

New accounts start as customers. Promote a user to **DeliveryMen** or **admin** from the admin *Users* page, or by editing the `role` field in the `users` collection.

## Roadmap

- Enforce roles and ownership checks on every API route
- Verify Firebase ID tokens on the server before issuing the session cookie
- Record payments server-side with Stripe webhooks
- Move from MongoDB to PostgreSQL for relational parcel/rider/review data
