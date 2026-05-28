-- ============================================================
-- SenimdiQAdam — core-svc migration
-- Добавляем поля и модели которые есть в schema.prisma
-- но отсутствовали в предыдущих миграциях:
--   • User.totpSecret / User.isTotpEnabled (2FA)
--   • VerificationLog.statusFrom / statusTo / method
--   • OrgService (услуги организаций)
--   • DeviceToken (FCM push-токены)
--   • Notification (in-app уведомления)
--   • AuditLog (история действий администратора)
--   • UserProfile.accessibilityPrefs (настройки доступности)
-- ============================================================

-- ─── 1. User: поля для 2FA ────────────────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "totpSecret"    TEXT,
  ADD COLUMN IF NOT EXISTS "isTotpEnabled" BOOLEAN NOT NULL DEFAULT false;

-- ─── 2. VerificationLog: аудит изменений статуса организации ─────────────────
ALTER TABLE "VerificationLog"
  ADD COLUMN IF NOT EXISTS "statusFrom" "OrgStatus",
  ADD COLUMN IF NOT EXISTS "statusTo"   "OrgStatus",
  ADD COLUMN IF NOT EXISTS "method"     TEXT;

-- ─── 3. UserProfile: настройки доступности ───────────────────────────────────
ALTER TABLE "UserProfile"
  ADD COLUMN IF NOT EXISTS "accessibilityPrefs" JSONB;

-- Делаем firstName и lastName nullable — OAuth-пользователи могут не иметь имени
-- до заполнения профиля. Пустой null семантически чище чем пустая строка ''.
ALTER TABLE "UserProfile"
  ALTER COLUMN "firstName" DROP NOT NULL,
  ALTER COLUMN "lastName"  DROP NOT NULL;

-- ─── 4. OrgService: услуги организаций ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrgService" (
    "id"             TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nameRu"         TEXT NOT NULL,
    "nameKk"         TEXT,
    "descriptionRu"  TEXT,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "price"          DOUBLE PRECISION,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgService_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OrgService_organizationId_idx" ON "OrgService"("organizationId");

ALTER TABLE "OrgService"
  ADD CONSTRAINT "OrgService_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 5. DeviceToken: FCM push-токены пользователей ───────────────────────────
CREATE TABLE IF NOT EXISTS "DeviceToken" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "platform"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DeviceToken_token_key" ON "DeviceToken"("token");
CREATE INDEX IF NOT EXISTS "DeviceToken_userId_idx" ON "DeviceToken"("userId");

ALTER TABLE "DeviceToken"
  ADD CONSTRAINT "DeviceToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 6. Notification: in-app уведомления ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Notification" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "body"      TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "data"      JSONB,
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 7. AuditLog: история действий администратора ────────────────────────────
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id"         TEXT NOT NULL,
    "actorId"    TEXT NOT NULL,
    "action"     TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId"   TEXT NOT NULL,
    "metadata"   JSONB,
    "ip"         TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx"           ON "AuditLog"("actorId");
CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx"         ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx"            ON "AuditLog"("action");

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
