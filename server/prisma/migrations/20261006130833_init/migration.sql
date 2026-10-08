-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('customer', 'rider', 'admin');

-- CreateEnum
CREATE TYPE "parcel_type" AS ENUM ('regular', 'express', 'international');

-- CreateEnum
CREATE TYPE "parcel_status" AS ENUM ('pending', 'on_the_way', 'delivered', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "photo_url" TEXT,
    "phone" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'customer',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_phone" TEXT NOT NULL,
    "type" "parcel_type" NOT NULL,
    "weight_kg" DECIMAL(6,2) NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_phone" TEXT NOT NULL,
    "recipient_address" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "pickup_date" DATE NOT NULL,
    "estimated_delivery" DATE,
    "price_cents" INTEGER NOT NULL,
    "status" "parcel_status" NOT NULL DEFAULT 'pending',
    "rider_id" UUID,
    "delivered_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "parcel_id" UUID NOT NULL,
    "rider_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "feedback" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "parcel_id" UUID NOT NULL,
    "stripe_payment_intent_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "paid_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "parcels_customer_id_idx" ON "parcels"("customer_id");

-- CreateIndex
CREATE INDEX "parcels_rider_id_status_idx" ON "parcels"("rider_id", "status");

-- CreateIndex
CREATE INDEX "parcels_created_at_idx" ON "parcels"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_parcel_id_key" ON "reviews"("parcel_id");

-- CreateIndex
CREATE INDEX "reviews_rider_id_idx" ON "reviews"("rider_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_parcel_id_key" ON "payments"("parcel_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_parcel_id_fkey" FOREIGN KEY ("parcel_id") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_parcel_id_fkey" FOREIGN KEY ("parcel_id") REFERENCES "parcels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Data rules Prisma's schema language can't express
ALTER TABLE "users" ADD CONSTRAINT "users_email_lowercase" CHECK ("email" = lower("email"));
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_weight_positive" CHECK ("weight_kg" > 0);
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_price_non_negative" CHECK ("price_cents" >= 0);
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_latitude_range" CHECK ("latitude" BETWEEN -90 AND 90);
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_longitude_range" CHECK ("longitude" BETWEEN -180 AND 180);
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_positive" CHECK ("amount_cents" > 0);
