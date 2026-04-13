-- Создаёт или обновляет администратора для AdminJS панели
-- Пароль: Admin2026!  (bcrypt hash 12 rounds)
-- Запуск:
--   psql "postgresql://core_user:core_pass@localhost:5434/core_db" -f prisma/seed-admin.sql

DO $$
DECLARE
  v_user_id TEXT;
  v_hash    TEXT := '$2b$12$PQeCyfPNklh4JFxRNRBnPeRZigBlPyiQHINIusRicIzSy.jjCFb52';
  v_email   TEXT := 'admin@senimdi.kz';
BEGIN

  -- Проверяем — есть ли уже такой юзер
  SELECT id INTO v_user_id FROM "User" WHERE email = v_email;

  IF v_user_id IS NULL THEN
    -- Создаём нового
    v_user_id := gen_random_uuid()::TEXT;

    INSERT INTO "User" (id, email, "passwordHash", role, "isVerified", "isActive", "createdAt", "updatedAt")
    VALUES (v_user_id, v_email, v_hash, 'ADMIN', true, true, NOW(), NOW());

    INSERT INTO "UserProfile" (id, "userId", "firstName", "lastName", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::TEXT, v_user_id, 'Алуа', 'Сенімді', NOW(), NOW());

    RAISE NOTICE '✅ Администратор создан: %', v_email;
  ELSE
    -- Обновляем существующего
    UPDATE "User"
    SET role = 'ADMIN', "passwordHash" = v_hash, "isActive" = true, "updatedAt" = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE '✅ Администратор обновлён: %', v_email;
  END IF;

END $$;

-- Проверяем результат
SELECT id, email, role, "isActive", "isVerified" FROM "User" WHERE email = 'admin@senimdi.kz';
