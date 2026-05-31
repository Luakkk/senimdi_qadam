-- Добавляем GIN pg_trgm индекс на nameKk для полнотекстового поиска на казахском языке.
-- Пользователи, ищущие организации по казахскому названию, теперь используют
-- тот же быстрый trigram similarity путь, что и поиск по nameRu.
-- Требует расширения pg_trgm (создано в 20260527000001).

CREATE INDEX IF NOT EXISTS "idx_org_name_kk_trgm"
  ON "Organization" USING gin ("nameKk" gin_trgm_ops)
  WHERE "nameKk" IS NOT NULL;
