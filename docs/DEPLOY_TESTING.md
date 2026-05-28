# 🚀 SenimdiQAdam — Гайд по деплою и тестированию

## ШАГ 0 — Подготовка .env

```bash
cd infra
cp ../.env.example .env   # или скопируй существующий
```

**Обязательные переменные (без них не запустится):**
```
JWT_SECRET=         # минимум 32 символа
JWT_REFRESH_SECRET= # другой, тоже 32+ символа
REDIS_PASSWORD=     # любой сложный пароль
CORE_DB_PASSWORD=   
TAXI_DB_PASSWORD=   
AI_DB_PASSWORD=     
ADMIN_COOKIE_SECRET= # для AdminJS сессий
RESEND_API_KEY=     # для email-верификации
GOOGLE_CLIENT_ID=   # Google OAuth
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
ADMIN_KEY=          # для /internal/* эндпоинтов
```

---

## ШАГ 1 — Первый запуск

```bash
cd infra
docker compose up --build -d
```

**Порядок старта (автоматический, через healthchecks):**
1. PostgreSQL ×3 + Redis + MinIO — базы данных
2. core-svc и taxi-svc — запускают `prisma migrate deploy`, потом сервис
3. gateway-api и ai-svc — стартуют когда upstream ready

**Следить за логами:**
```bash
docker compose logs -f core-svc     # миграции core
docker compose logs -f taxi-svc     # миграции taxi
docker compose logs -f gateway-api  # AdminJS инит
docker compose logs -f ai-svc       # Whisper model load
```

**Проверить что всё healthy:**
```bash
docker compose ps
# Все сервисы должны показать: Up (healthy)
```

---

## ШАГ 2 — Создать первого Admin пользователя

```bash
# Вариант А — через seed (если настроен)
docker exec core_svc npx ts-node prisma/seed-admin.ts

# Вариант Б — вручную через API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@senimdi-qadam.kz",
    "password": "StrongPass123!",
    "firstName": "Admin",
    "lastName": "SenimdiQadam",
    "role": "USER"
  }'

# Затем через SQL поменять роль на ADMIN:
docker exec -it core_db psql -U core_user -d core_db \
  -c "UPDATE \"User\" SET role='ADMIN' WHERE email='admin@senimdi-qadam.kz';"
```

---

## ШАГ 3 — Тестирование по сервисам

### 3.1 core-svc (http://localhost:3001)

**Swagger UI:** http://localhost:3001/api/docs

| Тест | Метод | URL | Ожидаемый результат |
|------|-------|-----|---------------------|
| Health | GET | /api/health | `{"status":"ok"}` |
| Регистрация | POST | /api/auth/register | 201 + user object |
| Логин | POST | /api/auth/login | 200 + accessToken + refreshToken |
| Получить себя | GET | /api/auth/me | 200 + user (требует Bearer) |
| Обновить профиль | PATCH | /api/profile/me | 200 |
| Список организаций | GET | /api/organizations | 200 + массив |
| Google OAuth | GET | /api/auth/google | редирект на Google |

**Проверить 2FA:**
```bash
# Включить TOTP
curl -X POST http://localhost:3001/api/auth/totp/setup \
  -H "Authorization: Bearer <token>"
# → QR-код + secret

# Верифицировать TOTP
curl -X POST http://localhost:3001/api/auth/totp/verify \
  -H "Authorization: Bearer <token>" \
  -d '{"code":"123456"}'
```

---

### 3.2 taxi-svc (http://localhost:3002)

**Swagger UI:** http://localhost:3002/docs

| Тест | Метод | URL | Ожидаемый результат |
|------|-------|-----|---------------------|
| Health | GET | /health | `{"status":"ok","service":"taxi-svc"}` |
| Создать бронь | POST | /bookings | 201 (требует USER JWT) |
| Список броней | GET | /bookings | 200 + массив |
| WebSocket | WS | ws://localhost:3002/taxi | подключение |

---

### 3.3 gateway-api (http://localhost:3000)

**Swagger UI:** http://localhost:3000/api/docs  
**AdminJS панель:** http://localhost:3000/admin

| Тест | Метод | URL | Ожидаемый результат |
|------|-------|-----|---------------------|
| Прокси core | GET | /api/core/health | редирект к core-svc |
| Прокси taxi | GET | /api/taxi/health | редирект к taxi-svc |
| AdminJS | GET | /admin | страница логина |
| Admin логин | POST | /admin/login | кука + редирект в панель |

**Проверить AdminJS:**
1. Открыть http://localhost:3000/admin
2. Ввести email и пароль ADMIN пользователя
3. Должен открыться дашборд с числом users/orgs/bookings
4. Проверить разделы: Users, Organizations, News, Bookings, Drivers

---

### 3.4 ai-svc (http://localhost:8000)

**Swagger UI:** http://localhost:8000/docs

| Тест | Метод | URL | Ожидаемый результат |
|------|-------|-----|---------------------|
| Health | GET | /health | `{"status":"ok","service":"ai-svc"}` |
| RAG поиск | POST | /rag/search | ответ AI на вопрос |
| STT | POST | /speech/transcribe | транскрипт аудио |
| TTS | POST | /speech/synthesize | MP3 файл |

```bash
# Проверить RAG (нужен JWT токен из core-svc)
curl -X POST http://localhost:8000/rag/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query": "организации для людей с нарушением зрения в Алматы"}'
```

---

### 3.5 Prometheus + Grafana

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3010 (admin / senimdi_grafana)

Проверить targets: http://localhost:9090/targets — все сервисы должны быть `UP`

---

## ШАГ 4 — Проверить миграции

```bash
# core-svc — проверить что все таблицы созданы
docker exec core_db psql -U core_user -d core_db \
  -c "\dt" | grep -E "(AuditLog|Notification|DeviceToken|OrgService)"

# taxi-svc — проверить новые таблицы
docker exec taxi_db psql -U taxi_user -d taxi_db \
  -c "\dt" | grep -E "(RecurringBooking|PaymentTransaction)"

# Проверить что enum PaymentStatus создан в taxi_db
docker exec taxi_db psql -U taxi_user -d taxi_db \
  -c "\dT" | grep -E "(PaymentStatus|PaymentMethod)"
```

---

## ШАГ 5 — Проверить безопасность

```bash
# 1. Redis без пароля должен быть недоступен
docker exec senimdi_redis redis-cli ping
# → NOAUTH Authentication required

# 2. Redis с паролем
docker exec senimdi_redis redis-cli -a "$REDIS_PASSWORD" ping
# → PONG

# 3. Internal эндпоинт без ключа — должен вернуть 403
curl http://localhost:3001/api/internal/verify-token \
  -H "Authorization: Bearer test"
# → 403

# 4. Rate limiting на auth (после 5 запросов за минуту — 429)
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3001/api/auth/login \
    -d '{"email":"x@x.com","password":"wrong"}'
done
# → 200/401 × 5, затем 429

# 5. Проверить что taxi_db недоступна из core-svc (network isolation)
docker exec core_svc sh -c "nc -zv taxi_db 5432" 2>&1 | head -3
# → nc: bad address 'taxi_db' (или Connection refused) — всё правильно
```

---

## ШАГ 6 — WebSocket тестирование

```bash
# Установить wscat (если нет)
npm install -g wscat

# Подключиться к taxi namespace через gateway
wscat -c "ws://localhost:3000/taxi" \
  --header "Authorization: Bearer <token>"

# Или напрямую к taxi-svc
wscat -c "ws://localhost:3002/taxi" \
  --header "Authorization: Bearer <token>"
```

---

## Типичные ошибки и их причины

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `column "descriptionRu" does not exist` | Старая trgm миграция | Уже исправлено в 20260527000001 |
| `null value in column "firstName"` | UserProfile NOT NULL | Уже исправлено в 20260527000002 |
| AdminJS: 401 при логине | URL без /api префикса | Уже исправлено в admin.module.ts |
| `Gateway timeout 502` | core-svc не успел стартовать | Подожди, healthcheck сам разберётся |
| `NOAUTH` в Redis | Пароль не задан в .env | Добавь REDIS_PASSWORD= в .env |
| Whisper timeout при первом запросе | Модель не скачана | Dockerfile теперь кэширует при сборке |

---

## Команды для быстрого рестарта

```bash
# Перезапустить один сервис после изменений
docker compose up --build core-svc -d

# Посмотреть логи с фильтром ошибок
docker compose logs core-svc 2>&1 | grep -E "(ERROR|WARN|✅|❌)"

# Полная пересборка (если что-то идёт не так)
docker compose down -v   # ⚠️ удаляет данные!
docker compose up --build -d

# Войти в контейнер для дебага
docker exec -it core_svc sh
docker exec -it ai_svc bash
```
