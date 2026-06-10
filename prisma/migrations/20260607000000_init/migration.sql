warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'starter', 'practice', 'pro');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('waiting', 'invited', 'booked', 'expired');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('sms', 'email');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('confirmation', 'reminder', 'cancellation', 'waitlist_invite');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('sent', 'failed', 'delivered');

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "specialty" VARCHAR(100),
    "clinic_name" VARCHAR(150),
    "clinic_address" TEXT,
    "phone" VARCHAR(20),
    "timezone" VARCHAR(60) NOT NULL DEFAULT 'America/New_York',
    "avatar_url" TEXT,
    "bio" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "stripe_customer_id" VARCHAR(60),
    "stripe_subscription_id" VARCHAR(60),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "welcome_message" TEXT,
    "brand_color" VARCHAR(9) NOT NULL DEFAULT '#0ea5e9',
    "cancellation_policy" TEXT,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "sms_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "reminder_hours_before" SMALLINT NOT NULL DEFAULT 24,
    "require_deposit" BOOLEAN NOT NULL DEFAULT false,
    "deposit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "onboarded_at" TIMESTAMPTZ(6),

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "duration_min" SMALLINT NOT NULL DEFAULT 30,
    "price_cents" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(9) NOT NULL DEFAULT '#0ea5e9',
    "is_telehealth" BOOLEAN NOT NULL DEFAULT false,
    "intake_note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "slot_duration_min" SMALLINT NOT NULL DEFAULT 30,
    "break_start" VARCHAR(5),
    "break_end" VARCHAR(5),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_slots" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "blocked_date" DATE NOT NULL,
    "start_time" VARCHAR(5),
    "end_time" VARCHAR(5),
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "date_of_birth" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "service_id" UUID,
    "appointment_date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "reason" TEXT,
    "is_telehealth" BOOLEAN NOT NULL DEFAULT false,
    "video_room_url" TEXT,
    "cancel_token" UUID NOT NULL,
    "deposit_paid" DECIMAL(10,2),
    "stripe_payment_id" VARCHAR(60),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "preferred_date" DATE NOT NULL,
    "notified_at" TIMESTAMPTZ(6),
    "invite_expires_at" TIMESTAMPTZ(6),
    "status" "WaitlistStatus" NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications_log" (
    "id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "type" "NotificationType" NOT NULL,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NotificationStatus" NOT NULL DEFAULT 'sent',
    "provider_msg_id" VARCHAR(80),

    CONSTRAINT "notifications_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_slug_key" ON "doctors"("slug");

-- CreateIndex
CREATE INDEX "services_doctor_id_idx" ON "services"("doctor_id");

-- CreateIndex
CREATE INDEX "availability_rules_doctor_id_idx" ON "availability_rules"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_rules_doctor_id_day_of_week_key" ON "availability_rules"("doctor_id", "day_of_week");

-- CreateIndex
CREATE INDEX "blocked_slots_doctor_id_blocked_date_idx" ON "blocked_slots"("doctor_id", "blocked_date");

-- CreateIndex
CREATE INDEX "patients_phone_idx" ON "patients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_cancel_token_key" ON "appointments"("cancel_token");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_appointment_date_idx" ON "appointments"("doctor_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_cancel_token_idx" ON "appointments"("cancel_token");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctor_id_appointment_date_start_time_key" ON "appointments"("doctor_id", "appointment_date", "start_time");

-- CreateIndex
CREATE INDEX "waitlist_doctor_id_preferred_date_status_idx" ON "waitlist"("doctor_id", "preferred_date", "status");

-- CreateIndex
CREATE INDEX "notifications_log_appointment_id_idx" ON "notifications_log"("appointment_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_log" ADD CONSTRAINT "notifications_log_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

