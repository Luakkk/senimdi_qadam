-- Включаем расширение pg_trgm (входит в PostgreSQL contrib, доступно без суперправ).
-- Нужно для GIN-индексов по тексту — поддерживает ILIKE '%...%' без sequential scan.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram индекс на поле nameRu — основное поле поиска организаций.
-- До этого ILIKE '%query%' делал sequential scan по всей таблице.
-- С GIN индексом запрос использует быстрый bitmap index scan.
CREATE INDEX IF NOT EXISTS "idx_org_name_ru_trgm"
  ON "Organization" USING gin ("nameRu" gin_trgm_ops);

-- GIN trigram индекс на поле nameKk — казахское название.
CREATE INDEX IF NOT EXISTS "idx_org_name_kk_trgm"
  ON "Organization" USING gin ("nameKk" gin_trgm_ops);

-- GIN trigram индекс на описание (если используется в поиске).
-- ⚠️  Колонка называется "description", не "descriptionRu" — это поле Organization.description
CREATE INDEX IF NOT EXISTS "idx_org_description_trgm"
  ON "Organization" USING gin ("description" gin_trgm_ops);
