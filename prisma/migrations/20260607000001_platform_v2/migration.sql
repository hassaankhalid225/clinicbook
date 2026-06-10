-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'doctor', 'client');

-- CreateEnum
CREATE TYPE "MarketplaceStatus" AS ENUM ('pending', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "ModuleStatus" AS ENUM ('active', 'beta', 'coming_soon');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('incomplete', 'active', 'past_due', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('module_subscription', 'booking');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe', 'mock');

-- CreateEnum
CREATE TYPE "ApptPaymentStatus" AS ENUM ('unpaid', 'paid', 'refunded', 'waived');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('waiting', 'in_progress', 'completed', 'skipped', 'cancelled');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "payment_status" "ApptPaymentStatus" NOT NULL DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "awards" JSONB,
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "city" VARCHAR(80),
ADD COLUMN     "country" VARCHAR(80),
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "education" JSONB,
ADD COLUMN     "experience_years" SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "geo_lat" DOUBLE PRECISION,
ADD COLUMN     "geo_lng" DOUBLE PRECISION,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "marketplace_status" "MarketplaceStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "procedures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profile_views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "social" JSONB,
ADD COLUMN     "sub_specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tenant_id" UUID,
ADD COLUMN     "title" VARCHAR(60),
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_modules" (
    "id" UUID NOT NULL,
    "key" VARCHAR(40) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "price_monthly_cents" INTEGER NOT NULL DEFAULT 0,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "status" "ModuleStatus" NOT NULL DEFAULT 'active',
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_price_history" (
    "id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "old_price_cents" INTEGER NOT NULL,
    "new_price_cents" INTEGER NOT NULL,
    "changed_by" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_modules" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "activated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "doctor_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'incomplete',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'mock',
    "stripe_customer_id" VARCHAR(60),
    "stripe_subscription_id" VARCHAR(60),
    "total_monthly_cents" INTEGER NOT NULL DEFAULT 0,
    "current_period_end" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "doctor_id" UUID,
    "appointment_id" UUID,
    "kind" "PaymentKind" NOT NULL,
    "status" "PaymentState" NOT NULL DEFAULT 'pending',
    "provider" "PaymentProvider" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "stripe_session_id" VARCHAR(120),
    "stripe_payment_intent_id" VARCHAR(120),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "receipt_number" VARCHAR(40) NOT NULL,
    "appointment_id" UUID NOT NULL,
    "payment_id" UUID,
    "doctor_id" UUID NOT NULL,
    "patient_name" VARCHAR(100) NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "payment_status" "ApptPaymentStatus" NOT NULL DEFAULT 'unpaid',
    "notes" TEXT,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_entries" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "token_number" INTEGER NOT NULL,
    "appointment_id" UUID,
    "patient_name" VARCHAR(100) NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'waiting',
    "checked_in_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_reviews" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "appointment_id" UUID,
    "patient_name" VARCHAR(100) NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT NOT NULL,
    "reply" TEXT,
    "replied_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "platform_modules_key_key" ON "platform_modules"("key");

-- CreateIndex
CREATE INDEX "module_price_history_module_id_idx" ON "module_price_history"("module_id");

-- CreateIndex
CREATE INDEX "doctor_modules_doctor_id_idx" ON "doctor_modules"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_modules_doctor_id_module_id_key" ON "doctor_modules"("doctor_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_subscriptions_doctor_id_key" ON "tenant_subscriptions"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_session_id_key" ON "payments"("stripe_session_id");

-- CreateIndex
CREATE INDEX "payments_doctor_id_idx" ON "payments"("doctor_id");

-- CreateIndex
CREATE INDEX "payments_appointment_id_idx" ON "payments"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_appointment_id_key" ON "receipts"("appointment_id");

-- CreateIndex
CREATE INDEX "receipts_doctor_id_idx" ON "receipts"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "queue_entries_appointment_id_key" ON "queue_entries"("appointment_id");

-- CreateIndex
CREATE INDEX "queue_entries_doctor_id_date_idx" ON "queue_entries"("doctor_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "queue_entries_doctor_id_date_token_number_key" ON "queue_entries"("doctor_id", "date", "token_number");

-- CreateIndex
CREATE INDEX "doctor_reviews_doctor_id_idx" ON "doctor_reviews"("doctor_id");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_price_history" ADD CONSTRAINT "module_price_history_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "platform_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_modules" ADD CONSTRAINT "doctor_modules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_modules" ADD CONSTRAINT "doctor_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "platform_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_reviews" ADD CONSTRAINT "doctor_reviews_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

