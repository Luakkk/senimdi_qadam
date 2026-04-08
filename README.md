# SenimdiQAdam — Платформа для людей с инвалидностью

**Автор:** Сманова Алуа Рустамовна
**Университет:** КБТУ (Казахстанско-Британский технический университет)
**Курс:** 4 курс, Бэкенд-разработка
**Год:** 2026

---

## О проекте

SenimdiQAdam — инклюзивная веб-платформа для людей с инвалидностью в Алматы, Казахстан.

**Три основных направления:**

1. **Каталог организаций** — реабилитационные центры, медицинские учреждения, юридическая помощь, спорт, образование. Поиск по геолокации, фильтры по категории и доступности.

2. **Новостная лента** — пользователи публикуют новости и истории, система модерации, лайки и комментарии.

3. **InvaTaxi** — доступное такси для людей с инвалидностью. Менеджер принимает заявки, назначает водителей. Чат менеджер ↔ пользователь, прямой WhatsApp-контакт с водителем, рейтинг 1–5★.

4. **AI-ассистент** — чат с поиском по базе организаций (RAG), голосовой ввод (STT) и голосовые ответы (TTS).

---

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│                  gateway-api :3000                  │
│              (единая точка входа)                   │
└────────┬──────────────┬──────────────┬──────────────┘
         │              │              │
    core-svc        taxi-svc       ai-svc
      :3001           :3002          :8000
   (NestJS)        (NestJS)       (FastAPI)
  PostgreSQL      PostgreSQL   PostgreSQL+pgvector
    :5434           :5435          :5436
         │
       Redis :6379
    (JWT blacklist + cache)
```

---

## Стек технологий

| Слой | Технология |
|------|-----------|
| Backend | NestJS (TypeScript) |
| AI сервис | FastAPI (Python) |
| ORM | Prisma 7 |
| База данных | PostgreSQL 16 |
| Векторный поиск | pgvector |
| Кэш / сессии | Redis 7 |
| Auth | JWT (access + refresh) + Google OAuth |
| AI | Azure OpenAI (GPT-4o) |
| STT/TTS | Azure Speech Services |
| Контейнеризация | Docker + Docker Compose |
| Документация API | Swagger / OpenAPI |

---

## Запуск проекта

### Требования
- Docker и Docker Compose
- Node.js 20+
- Python 3.11+

### 1. Поднять инфраструктуру (БД + Redis)

```bash
docker compose up -d core_db taxi_db ai_db redis
```

### 2. Запустить core-svc

```bash
cd services/core-svc
npm install
npx prisma migrate deploy
npm run start:dev
# http://localhost:3001/api/docs
```

### 3. Запустить taxi-svc

```bash
cd services/taxi-svc
npm install
npx prisma migrate deploy
npm run start:dev
# http://localhost:3002/docs
```

### 4. Запустить ai-svc

```bash
cd services/ai-svc
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# http://localhost:8000/docs
```

### 5. Запустить gateway-api

```bash
cd services/gateway-api
npm install
npm run start:dev
# http://localhost:3000/api/docs
```

---

## Переменные окружения

Скопируй `.env.example` → `.env` в каждом сервисе и заполни:

```
# core-svc/.env
DATABASE_URL=postgresql://core_user:core_pass@localhost:5434/core_db
JWT_SECRET=your-secret
REDIS_HOST=localhost
REDIS_PORT=6379

# taxi-svc/.env
DATABASE_URL=postgresql://taxi_user:taxi_pass@localhost:5435/taxi_db
JWT_SECRET=your-secret

# ai-svc/.env
DATABASE_URL=postgresql://ai_user:ai_pass@localhost:5436/ai_db
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_KEY=...
```

---

## Роли пользователей

| Роль | Описание |
|------|----------|
| `USER` | Обычный пользователь с инвалидностью |
| `RELATIVE` | Родственник/опекун |
| `ORG_MANAGER` | Менеджер организации |
| `TAXI_MANAGER` | Менеджер InvaTaxi (регистрация через инвайт-код) |
| `MODERATOR` | Модератор контента |
| `ADMIN` | Администратор платформы |

---

## Структура репозитория

```
senim-qadam/
├── services/
│   ├── core-svc/      # Основной сервис (auth, профили, организации, новости)
│   ├── taxi-svc/      # InvaTaxi (заявки, водители, менеджер, чат)
│   ├── gateway-api/   # API Gateway (прокси)
│   └── ai-svc/        # AI-ассистент (FastAPI + RAG + STT/TTS)
├── infra/
│   └── docker-compose.yml
├── data/              # Каталоги организаций (CSV/Excel)
└── docs/              # Документация
```
