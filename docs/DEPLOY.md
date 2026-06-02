# Деплой SenimdiQAdam

Пошаговая инструкция, как вывести проект в боевую среду. Написана простым языком — по шагам, с командами.

---

## Что уже готово в проекте

- **Боевой конфиг** `infra/docker-compose.prod.yml` — поднимает nginx (вход + HTTPS), все базы, redis, minio, 4 сервиса и мониторинг. Внутренние сервисы наружу не торчат — открыты только порты 80/443 (nginx) и minio.
- **nginx** `infra/nginx.conf` — обратный прокси, терминирует HTTPS (сертификаты Let's Encrypt), проксирует на шлюз и пробрасывает WebSocket.
- **Автосборка** `.github/workflows/docker.yml` — на пуш в `main` собирает Docker-образы и кладёт в GitHub Container Registry (ghcr.io).
- **CI** `.github/workflows/ci.yml` — на pull request гоняет линт и тесты.

---

## Вариант 1 — VPS + Docker Compose (рекомендуется, проще всего)

Один сервер, на нём весь стек. Подходит для дипломного/боевого запуска.

### Шаг 1. Взять сервер

Любой VPS с Ubuntu 22.04+, минимум **2 CPU / 4 ГБ RAM** (из-за faster-whisper и нескольких баз лучше 4 CPU / 8 ГБ).

Варианты хостинга:
- **Hetzner Cloud** — дёшево (~4–8 €/мес), быстро. Дата-центры в Европе.
- **DigitalOcean / Vultr** — просто, много гайдов.
- **Yandex Cloud / Timeweb Cloud** — ближе к казахстанской аудитории (меньше задержка), оплата в ₸/₽.

### Шаг 2. Подготовить сервер

```bash
# подключиться
ssh root@IP_СЕРВЕРА

# установить Docker
curl -fsSL https://get.docker.com | sh

# поставить git
apt update && apt install -y git
```

### Шаг 3. Забрать код

```bash
git clone https://github.com/ТВОЙ_АККАУНТ/senimdi_qadam.git
cd senimdi_qadam
```

### Шаг 4. Заполнить секреты

```bash
cp infra/.env.example infra/.env
nano infra/.env
```

Обязательно заполни боевыми значениями: пароли БД, `JWT_SECRET`/`JWT_REFRESH_SECRET` (длинные случайные строки), `ENCRYPTION_KEY`, ключи Azure OpenAI, `MINIO_ROOT_PASSWORD`, `ADMIN_COOKIE_SECRET`, `FRONTEND_URL` (адрес твоего фронта), `GOOGLE_CALLBACK_URL` (`https://твой-домен/api/auth/google/callback`).

> Никогда не коммить этот файл в git — он уже в `.gitignore`.

### Шаг 5. Настроить домен и HTTPS

1. В DNS домена создай A-запись на IP сервера (например `api.senimdi-qadam.kz` → IP).
2. Пропиши этот домен в `infra/nginx.conf` (`server_name`).
3. Получи бесплатный SSL-сертификат Let's Encrypt:

```bash
apt install -y certbot
certbot certonly --standalone -d api.твой-домен.kz
# сертификаты лягут в /etc/letsencrypt — именно туда смотрит nginx из prod-compose
```

### Шаг 6. Запустить боевой стек

```bash
cd infra
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Проверить, что всё живо:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl https://api.твой-домен.kz/api/health
```

### Шаг 7. Применить миграции БД (первый запуск)

```bash
docker exec core_svc npx prisma migrate deploy
docker exec taxi_svc npx prisma migrate deploy
```

Готово. API доступно по `https://api.твой-домен.kz/api`, админка — `/admin`.

---

## Вариант 2 — готовые образы из ghcr.io (без сборки на сервере)

Если не хочешь собирать образы на сервере (это грузит CPU/RAM), используй уже собранные GitHub Actions.

1. Пуш в `main` → во вкладке **Actions** дождись, пока `Docker — Build & Push` соберёт образы.
2. Образы появятся в `ghcr.io/ТВОЙ_АККАУНТ/senimdi-qadam-*`.
3. На сервере залогинься в registry и подтяни образы вместо сборки:

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u ТВОЙ_АККАУНТ --password-stdin
# в docker-compose.prod.yml для сервисов указать image: ghcr.io/...
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

> Для этого варианта нужно в `docker-compose.prod.yml` заменить `build:` на `image: ghcr.io/...` для каждого сервиса. Если оставить как есть — стек собирается на сервере (вариант 1).

---

## Вариант 3 — управляемый хостинг (PaaS)

Если не хочешь возиться с сервером и nginx вручную:

- **Railway / Render** — деплой из git, каждый сервис отдельно, базы как managed-аддоны. Проще, но дороже и хуже ложится на мультисервисный compose.
- **Облачные VM + managed PostgreSQL/Redis** (Yandex Cloud, AWS) — выносишь базы в managed-сервисы, сервисы крутишь в Docker. Надёжнее для продакшена, сложнее в настройке.

Для студенческого/дипломного проекта **вариант 1 (VPS + Compose)** — оптимальный баланс простоты и контроля.

---

## Обновление боевой версии (после новых изменений)

```bash
cd senimdi_qadam
git pull
cd infra
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker exec core_svc npx prisma migrate deploy   # если были новые миграции
```

---

## Чек-лист перед первым деплоем

- [ ] `infra/.env` заполнен боевыми секретами, НЕ в git
- [ ] `JWT_SECRET`, `ENCRYPTION_KEY`, пароли — длинные случайные, не из примера
- [ ] Домен указывает на IP сервера (A-запись)
- [ ] SSL-сертификат получен (`/etc/letsencrypt`)
- [ ] `server_name` в `nginx.conf` = твой домен
- [ ] `GOOGLE_CALLBACK_URL` и `FRONTEND_URL` указывают на боевые адреса (https)
- [ ] В Google Cloud Console добавлен боевой redirect URI для OAuth
- [ ] Azure OpenAI: задеплоены и `gpt-4o`, и `text-embedding-3-small`
- [ ] Миграции применены (`prisma migrate deploy`)
- [ ] `curl https://домен/api/health` отвечает 200
- [ ] Создан первый ADMIN-пользователь для входа в `/admin`

---

## Мониторинг

В боевом стеке поднимаются Prometheus (`:9090`) и Grafana (`:3010`) — метрики сервисов. Ошибки можно собирать в Sentry (переменная `SENTRY_DSN`). Логи контейнеров ротируются (json-file, max 20m × 5 файлов).
