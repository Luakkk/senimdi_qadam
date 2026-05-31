-- ============================================================
-- SenimdiQAdam — core-svc migration
-- Notification.userId: NOT NULL → NULL
--
-- Причина: broadcast-уведомления (рассылка всем пользователям)
-- не имеют конкретного получателя. Комментарий в схеме говорит
-- "null = broadcast", но колонка была NOT NULL — это противоречие.
-- ============================================================

-- Удаляем FK-ограничение чтобы изменить nullable
ALTER TABLE "Notification"
  DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";

-- Делаем колонку nullable
ALTER TABLE "Notification"
  ALTER COLUMN "userId" DROP NOT NULL;

-- Восстанавливаем FK (теперь nullable — ON DELETE CASCADE сработает только при userId IS NOT NULL)
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
