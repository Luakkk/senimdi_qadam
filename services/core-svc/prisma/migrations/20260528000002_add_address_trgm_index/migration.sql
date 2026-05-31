-- ============================================================
-- SenimdiQAdam — core-svc migration
-- Добавляем GIN trigram индекс на колонку Organization.address
--
-- Причина: search() в organizations.service.ts использует
--   address % $query   (pg_trgm оператор)
-- Без индекса это sequential scan по всей таблице.
-- С GIN индексом — bitmap index scan, ~100x быстрее на больших данных.
--
-- pg_trgm уже включён миграцией 20260527000001.
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_org_address_trgm"
  ON "Organization" USING gin (address gin_trgm_ops);
