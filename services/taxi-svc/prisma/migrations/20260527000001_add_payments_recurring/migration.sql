-- ============================================================
-- SenimdiQAdam — taxi-svc migration
-- Добавляем всё что есть в schema.prisma но отсутствовало
-- в предыдущей миграции 20260408170757_redesign_invataxis:
--   • PaymentStatus enum
--   • PaymentMethod enum
--   • Driver.fcmToken (FCM push-токен водителя)
--   • Booking.estimatedPrice / paymentStatus / paymentMethod
--   • RecurringBooking (повторяющиеся поездки)
--   • PaymentTransaction (транзакции оплаты)
-- ============================================================

-- ─── 1. Новые enums ───────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'REFUNDED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'KASPI', 'CARD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. Driver: FCM push-токен ────────────────────────────────────────────────
ALTER TABLE "Driver"
  ADD COLUMN IF NOT EXISTS "fcmToken" TEXT;

-- ─── 3. Booking: поля оплаты ─────────────────────────────────────────────────
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "estimatedPrice"  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "paymentStatus"   "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS "paymentMethod"   "PaymentMethod";

-- ─── 4. RecurringBooking: повторяющиеся поездки ──────────────────────────────
CREATE TABLE IF NOT EXISTS "RecurringBooking" (
    "id"              TEXT NOT NULL,
    "userId"          TEXT NOT NULL,
    "fromAddress"     TEXT NOT NULL,
    "toAddress"       TEXT NOT NULL,
    "fromLat"         DOUBLE PRECISION,
    "fromLon"         DOUBLE PRECISION,
    "toLat"           DOUBLE PRECISION,
    "toLon"           DOUBLE PRECISION,
    "disabilityType"  "DisabilityType" NOT NULL,
    "note"            TEXT,
    "cronExpression"  TEXT NOT NULL,
    "isActive"        BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "nextRunAt"       TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringBooking_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RecurringBooking_userId_idx"           ON "RecurringBooking"("userId");
CREATE INDEX IF NOT EXISTS "RecurringBooking_isActive_nextRunAt_idx" ON "RecurringBooking"("isActive", "nextRunAt");

-- ─── 5. PaymentTransaction: транзакции оплаты ────────────────────────────────
CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
    "id"          TEXT NOT NULL,
    "bookingId"   TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "amount"      DOUBLE PRECISION NOT NULL,
    "method"      "PaymentMethod" NOT NULL,
    "status"      "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "externalId"  TEXT,
    "externalUrl" TEXT,
    "metadata"    JSONB,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PaymentTransaction_bookingId_idx" ON "PaymentTransaction"("bookingId");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_userId_idx"    ON "PaymentTransaction"("userId");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_status_idx"    ON "PaymentTransaction"("status");

ALTER TABLE "PaymentTransaction"
  ADD CONSTRAINT "PaymentTransaction_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
