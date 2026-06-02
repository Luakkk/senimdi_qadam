# SenimdiQAdam — Платформа для людей с инвалидностью

**Автор:** Сманова Алуа Рустамовна
**Университет:** КБТУ (Казахстанско-Британский технический университет)
**Курс:** 4 курс, Бэкенд-разработка
**Год:** 2026

---

## О проекте

SenimdiQAdam — инклюзивная веб-платформа для людей с инвалидностью в Алматы, Казахстан. Бэкенд построен как набор микросервисов за единым API-шлюзом. Поддерживаются два языка интерфейса (русский и казахский) — язык ответа выбирается по заголовку `Accept-Language`.

**Основные направления:**

1. **Каталог организаций** — реабилитационные центры, медицинские учреждения, юридическая помощь, спорт, образование. Поиск по геолокации, фильтры по категории и доступности, отзывы и рейтинг.

2. **Новостная лента** — пользователи публикуют новости и истории, система модерации, лайки и комментарии.

3. **InvaTaxi** — доступное такси для людей с инвалидностью. Менеджер принимает заявки и назначает водителей. Чат менеджер ↔ пользователь в реальном времени (WebSocket), отслеживание локации водителя, рейтинг 1–5★. Поддержка повторяющихся поездок (по расписанию).

4. **AI-ассистент «Сенім»** — чат-помощник на базе Azure OpenAI (GPT-4o), поиск ответов по базе документов (RAG), голосовой ввод (распознавание речи) и голосовые ответы (озвучка).

---

## Архитектура

```
                       Клиент (web / mobile)
                               │
                               ▼
                   ┌───────────────────────────┐
                   │     gateway-api :3000     │  ← единая точка входа
                   │  прокси + auth + rate-limit│     (+ AdminJS панель)
                   └───┬───────────┬───────────┬┘
                       │           │           │
              ┌────────▼──┐  ┌─────▼─────┐ ┌───▼────────┐
              │ core-svc  │  │ taxi-svc  │ │  ai-svc    │
              │  :3001    │  │  :3002    │ │  :8000     │
              │ (NestJS)  │  │ (NestJS)  │ │ (FastAPI)  │
              └────┬──────┘  └────┬──────┘ └────┬───────┘
                   │              │             │
              core_db :5434  taxi_db :5435  ai_db :5436
              (PostgreSQL)   (PostgreSQL)   (PG + pgvector)

   Общее: Redis :6379 (JWT-blacklist, кэш, OAuth-коды, rate-limit)
          MinIO :9000 (файлы: аватары, изображения новостей)
          Prometheus :9090 + Grafana :3010 (мониторинг)
```

**Почему шлюз.** Клиент обращается только к одному адресу (`:3000`). Шлюз проверяет токен, пробрасывает заголовки (включая `Accept-Language` для локализации), направляет запрос в нужный сервис и возвращает ответ. Обычные JSON-запросы идут через прокси-контроллер; загрузки файлов и бинарная озвучка — через raw-прокси; чат такси — через WebSocket-прокси.

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Backend | NestJS (TypeScript) |
| AI-сервис | FastAPI (Python 3.11) |
| ORM | Prisma 7 |
| База данных | PostgreSQL 16 |
| Векторный поиск | pgvector |
| Кэш / сессии | Redis 7 |
| Файловое хранилище | MinIO (S3-совместимое) |
| Auth | JWT (access + refresh) + Google OAuth + 2FA (TOTP) |
| AI-чат | Azure OpenAI (GPT-4o) |
| RAG-эмбеддинги | Azure OpenAI (text-embedding-3-small) |
| Озвучка (TTS) | edge-tts (бесплатно) |
| Распознавание речи (STT) | faster-whisper (локально, CPU) |
| Push-уведомления | Firebase Cloud Messaging |
| Email | Resend |
| Реал-тайм | WebSocket (Socket.IO) |
| Админ-панель | AdminJS |
| Мониторинг | Prometheus + Grafana, Sentry |
| Контейнеризация | Docker + Docker Compose |
| Документация API | Swagger / OpenAPI |
| CI/CD | GitHub Actions |

---

## Быстрый запуск (весь стек в Docker)

Самый простой способ — поднять всё одной командой.

```bash
# 1. Заполнить переменные окружения
cp infra/.env.example infra/.env
#    отредактировать infra/.env (пароли БД, JWT_SECRET, ключи Azure и т.д.)

# 2. Поднять весь стек
cd infra
docker compose up -d --build

# Точки входа:
#   Шлюз / API:     http://localhost:3000/api
#   Swagger:        http://localhost:3000/api/docs
#   Админ-панель:   http://localhost:3000/admin
#   MinIO консоль:  http://localhost:9001
#   Grafana:        http://localhost:3010
```

Пересобрать один сервис после правок:

```bash
cd infra
docker compose up -d --build gateway-api   # или core-svc / taxi-svc / ai-svc
```

---

## Запуск сервисов по отдельности (для разработки)

### 1. Инфраструктура (БД + Redis + MinIO)

```bash
cd infra
docker compose up -d core_db taxi_db ai_db redis minio
```

### 2. core-svc

```bash
cd services/core-svc
npm install
npx prisma migrate deploy
npm run start:dev
# http://localhost:3001/api/docs
```

### 3. taxi-svc

```bash
cd services/taxi-svc
npm install
npx prisma migrate deploy
npm run start:dev
# http://localhost:3002/docs
```

### 4. ai-svc

```bash
cd services/ai-svc
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# http://localhost:8000/docs
```

### 5. gateway-api

```bash
cd services/gateway-api
npm install
npm run start:dev
# http://localhost:3000/api/docs
```

---

## Переменные окружения

Все переменные собраны в одном файле `infra/.env` (см. `infra/.env.example`). Главные группы:

| Группа | Переменные |
|--------|-----------|
| Базы данных | `CORE_DB_*`, `TAXI_DB_*`, `AI_DB_*` |
| Redis | `REDIS_PASSWORD` |
| JWT / шифрование | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| Azure OpenAI | `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` |
| Файлы | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_PUBLIC_URL` |
| Email / Push | `RESEND_API_KEY`, `FIREBASE_*` |
| Прочее | `FRONTEND_URL`, `ADMIN_COOKIE_SECRET`, `SENTRY_DSN` |

> ⚠️ **Безопасность:** реальные `.env` файлы в репозиторий не коммитятся (они в `.gitignore`). В git хранятся только `.env.example` без секретов. Никогда не добавляй боевые ключи в git.

---

## Тестирование

В каталоге `docs/` лежат живые интеграционные тесты (curl + node), бьющие по реальным эндпоинтам поднятого стенда.

```bash
# Прогнать ВСЕ тесты по порядку с паузами под rate-limit и сводкой
bash docs/run_all.sh

# Или по отдельности:
bash docs/test_core.sh          # core-svc: auth, профили, организации, новости
bash docs/test_taxi.sh          # taxi-svc: заявки, водители, переходы статусов
bash docs/test_full.sh          # сквозной e2e сценарий
bash docs/test_roles.sh         # разграничение ролей
bash docs/test_security.sh      # безопасность (утечки, доступы)
bash docs/test_behavior.sh      # 2FA, throttle, cron повторяющихся поездок
node docs/test_ws.js            # WebSocket чат такси
bash docs/test_ai_gateway.sh    # ai-svc + проксирование через шлюз
```

Тесты ожидают, что стенд поднят (`docker compose up -d`). Логи каждого прогона пишутся в `docs/.test-logs/`.

---

## Роли пользователей

| Роль | Описание |
|------|----------|
| `USER` | Обычный пользователь с инвалидностью |
| `RELATIVE` | Родственник / опекун (привязка к подопечному) |
| `ORG_MANAGER` | Менеджер организации |
| `TAXI_MANAGER` | Менеджер InvaTaxi (регистрация по инвайт-коду) |
| `MODERATOR` | Модератор контента |
| `ADMIN` | Администратор платформы (полный доступ к AdminJS) |

---

## Деплой

Подробная пошаговая инструкция — в [`docs/DEPLOY.md`](docs/DEPLOY.md).

Коротко: пуш в `main` → GitHub Actions (`.github/workflows/docker.yml`) собирает образы всех 4 сервисов и публикует их в GitHub Container Registry (ghcr.io). На сервере поднимается боевой стек из `infra/docker-compose.prod.yml` (nginx + HTTPS, базы, redis, minio, сервисы, мониторинг).

---

## Структура репозитория

```
senimdi_qadam/
├── services/
│   ├── core-svc/      # Auth, профили, организации, новости, 2FA, OAuth
│   ├── taxi-svc/      # InvaTaxi: заявки, водители, менеджер, WS-чат
│   ├── gateway-api/   # API Gateway (прокси + AdminJS + rate-limit)
│   └── ai-svc/        # AI-ассистент (FastAPI + RAG + STT/TTS)
├── infra/
│   ├── docker-compose.yml          # локальная разработка
│   ├── docker-compose.prod.yml     # боевой стенд
│   ├── nginx.conf                  # обратный прокси + TLS
│   └── prometheus.yml              # конфиг мониторинга
├── .github/workflows/              # CI (lint+test) и Docker build&push
├── data/                           # каталоги организаций (CSV/Excel)
└── docs/                           # интеграционные тесты + документация
```

---

## CI/CD

| Workflow | Когда | Что делает |
|----------|-------|-----------|
| `.github/workflows/ci.yml` | PR в `main`/`develop`, пуш в `develop` | Линт и тесты сервисов |
| `.github/workflows/docker.yml` | Пуш в `main` | Сборка и публикация Docker-образов в ghcr.io |
