FROM python:3.11-slim
WORKDIR /app

# Системные зависимости для psycopg2 и faster-whisper
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Примечание: Whisper модель ('small', ~150MB) скачается при первом STT-запросе
# и будет закэширована в ~/.cache/huggingface внутри контейнера.

EXPOSE 8000

# ─── Горизонтальное масштабирование ai-svc ────────────────────────────────────
#
# ВЕРТИКАЛЬНОЕ (текущий подход — внутри одного контейнера):
#   --workers 4  →  4 отдельных процесса uvicorn на одном хосте.
#   GPT-4o / STT запросы занимают 3–30с; без воркеров они стоят в очереди.
#   Каждый воркер независим (нет GIL-проблем для CPU-bound Whisper).
#
# ГОРИЗОНТАЛЬНОЕ (несколько контейнеров, если один хост не справляется):
#   Поднять несколько реплик с помощью Docker Compose --scale:
#     docker compose up --scale ai-svc=3
#   Nginx (или gateway-api) должен балансировать через upstream round-robin.
#
# ⚠️  TRADE-OFF — RAM:
#   Whisper 'small' модель = ~500MB RAM на воркер.
#   4 воркера × 500MB = ~2GB только под модели.
#   В docker-compose.prod.yml выставлен mem_limit: 2g — это минимум.
#   Если нужно больше воркеров → увеличь mem_limit (или переключись на 'tiny').
#
# RATE LIMITING:
#   slowapi использует Redis как хранилище счётчиков (см. app/limiter.py).
#   Это означает что лимиты работают корректно при любом числе реплик —
#   все процессы/контейнеры читают из одного Redis.
#
# DB init: SQLAlchemy Base.metadata.create_all() вызывается в lifespan (main.py).
# Включает расширение pgvector. Миграции не нужны.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
