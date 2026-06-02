#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# Полная проверка эндпоинтов CORE-SVC на поднятом стенде.
# Бьём напрямую в core (:3001) — изолируем сервис от шлюза.
#
#   bash docs/test_core.sh                # USER-флоу + негативы (401/403/400)
#   ADMIN_KEY=xxxxx bash docs/test_core.sh   # + internal-роуты
#
# Админ берётся автоматически: admin@senimdi.kz / Admin2026! (из seed.ts).
# Переопределить: ADMIN_EMAIL=... ADMIN_PASSWORD=... bash docs/test_core.sh
# bash 3.2-совместимо (macOS).
# ──────────────────────────────────────────────────────────────────────────
set -u
CORE=http://localhost:3001/api
TS=$(date +%s)
EMAIL="u_${TS}@example.com"
PASS="Test1234"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@senimdi.kz}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin2026!}"
ADMIN_KEY="${ADMIN_KEY:-}"

P=0; F=0
ok(){   P=$((P+1)); echo "  ✅ $1"; }
no(){   F=$((F+1)); echo "  ❌ $1"; }
hdr(){ echo; echo "══ $1 ══"; }
# code EXPECTED METHOD PATH [TOKEN] [JSONBODY]
chk(){
  local label="$1" exp="$2" m="$3" path="$4" tok="${5:-}" body="${6:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$CORE$path")
  [ -n "$tok" ]  && args+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local code; code=$(curl "${args[@]}")
  if [ "$code" = "$exp" ]; then ok "$label ($m $path -> $code)"
  else no "$label ($m $path -> $code, ждали $exp)"; fi
}
# вернуть тело (для извлечения id/token)
body(){ # METHOD PATH TOKEN JSONBODY
  local m="$1" path="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -X "$m" "$CORE$path")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"
}
command -v jq >/dev/null || { echo "нужен jq (brew install jq)"; exit 1; }

# ═══════════════════════════ AUTH ═══════════════════════════
hdr "AUTH"
REG=$(body POST /auth/register "" "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"firstName\":\"Тест\",\"lastName\":\"Юзер\",\"role\":\"USER\"}")
echo "$REG" | jq -e '.accessToken' >/dev/null 2>&1 && ok "register USER -> токен (выдаётся сразу)" || no "register: $REG"
# register выдаёт рабочий токен сразу; JwtAuthGuard НЕ требует верификации — берём его как основной
TOKEN=$(echo "$REG" | jq -r '.accessToken // empty'); [ -z "$TOKEN" ] && { echo "нет токена из register — стоп"; exit 1; }
chk "register дубль email -> 409" 409 POST /auth/register "" "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"firstName\":\"A\",\"lastName\":\"B\",\"role\":\"USER\"}"
chk "register слабый пароль -> 400" 400 POST /auth/register "" "{\"email\":\"w_$TS@x.com\",\"password\":\"123\",\"firstName\":\"A\",\"lastName\":\"B\",\"role\":\"USER\"}"
chk "register лишнее поле name -> 400" 400 POST /auth/register "" "{\"email\":\"n_$TS@x.com\",\"password\":\"$PASS\",\"name\":\"X\",\"role\":\"USER\"}"
# login требует подтверждённый email (это by design) — login без верификации даёт 403
chk "login до верификации -> 403" 403 POST /auth/login "" "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
# подтверждаем email напрямую в БД, чтобы проверить happy-path login/blacklist
if docker exec core_db psql -U core_user -d core_db -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$EMAIL';" >/dev/null 2>&1; then
  LOG=$(body POST /auth/login "" "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
  echo "$LOG" | jq -e '.accessToken' >/dev/null 2>&1 && ok "login после верификации -> токен" || no "login: $LOG"
  NT=$(echo "$LOG" | jq -r '.accessToken // empty'); [ -n "$NT" ] && TOKEN="$NT"
else
  echo "  ⚠ не смог подтвердить email через docker exec core_db — login happy-path пропущен (работаем по токену из register)"
fi
chk "login неверный пароль -> 401" 401 POST /auth/login "" "{\"email\":\"$EMAIL\",\"password\":\"wrong\"}"
chk "me с токеном -> 200" 200 GET /auth/me "$TOKEN"
chk "me без токена -> 401" 401 GET /auth/me ""
chk "forgot-password -> 200" 200 POST /auth/forgot-password "" "{\"email\":\"$EMAIL\"}"

# ═══════════════════════════ PROFILE ═══════════════════════════
hdr "PROFILE"
chk "me -> 200"                 200 GET   /profile/me "$TOKEN"
chk "me без токена -> 401"      401 GET   /profile/me ""
chk "update me -> 200"         200 PATCH /profile/me "$TOKEN" '{"firstName":"Алуа","city":"Алматы"}'
chk "update me кривое поле -> 400" 400 PATCH /profile/me "$TOKEN" '{"firstName":12345}'
chk "location -> 200"          200 PATCH /profile/me/location "$TOKEN" '{"lat":43.238,"lon":76.889}'
chk "accessibility GET -> 200" 200 GET   /profile/me/accessibility "$TOKEN"
chk "liked-news -> 200"        200 GET   /profile/me/liked-news "$TOKEN"
chk "liked-guides -> 200"      200 GET   /profile/me/liked-guides "$TOKEN"
chk "device-token POST -> 201" 201 POST /profile/me/device-token "$TOKEN" '{"token":"fcm_test_token","platform":"android"}'
chk "links/my -> 200"          200 GET   /profile/links/my "$TOKEN"

# ═══════════════════════════ ORGANIZATIONS ═══════════════════════════
hdr "ORGANIZATIONS"
chk "list -> 200"     200 GET /organizations "$TOKEN"
chk "nearby -> 200"   200 GET "/organizations/nearby?lat=43.238&lon=76.889&radius=5000" "$TOKEN"
# query URL-кодируем: сырые кириллические байты в URL → HTTP-парсер отдаёт 400
chk "search -> 200"   200 GET "/organizations/search?query=%D1%86%D0%B5%D0%BD%D1%82%D1%80" "$TOKEN"
chk "mine USER без орг -> 403" 403 GET /organizations/mine "$TOKEN"   # роут для ORG_MANAGER
ORG=$(body POST /organizations/register "$TOKEN" '{"nameRu":"Тест Центр","city":"Алматы","lat":43.238,"lon":76.889}')
ORG_ID=$(echo "$ORG" | jq -r '.organizationId // .id // empty')
[ -n "$ORG_ID" ] && ok "register орг -> id=$ORG_ID" || no "register орг: $ORG"

# ═══════════════════════════ NEWS ═══════════════════════════
hdr "NEWS"
# админ-токен нужен заранее: новость создаётся как PENDING, её надо опубликовать
# (PATCH /news/:id/moderate), иначе GET/like/comment отдают 404 (by design — видна только PUBLISHED)
ALOG=$(body POST /auth/login "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ATOK=$(echo "$ALOG" | jq -r '.accessToken // empty')
chk "list -> 200" 200 GET /news "$TOKEN"
chk "my/list -> 200" 200 GET /news/my/list "$TOKEN"
chk "moderation/pending USER -> 403" 403 GET /news/moderation/pending "$TOKEN"
NEWS=$(body POST /news "$TOKEN" '{"titleRu":"Тест новость","bodyRu":"Текст проверки контента"}')
NEWS_ID=$(echo "$NEWS" | jq -r '.id // empty')
[ -n "$NEWS_ID" ] && ok "create news -> id=$NEWS_ID (PENDING)" || no "create news: $NEWS"
if [ -n "$NEWS_ID" ]; then
  chk "news PENDING -> 404 (ещё не опубликована)" 404 GET "/news/$NEWS_ID" "$TOKEN"
  if [ -n "$ATOK" ]; then
    chk "moderate -> PUBLISHED -> 200" 200 PATCH "/news/$NEWS_ID/moderate" "$ATOK" '{"status":"PUBLISHED"}'
  else
    no "нет admin-токена — не могу опубликовать новость"
  fi
  chk "news :id -> 200" 200 GET "/news/$NEWS_ID" "$TOKEN"
  chk "like toggle -> 200/201" 201 POST "/news/$NEWS_ID/like" "$TOKEN"
  chk "comment -> 200/201" 201 POST "/news/$NEWS_ID/comments" "$TOKEN" '{"text":"тестовый комментарий"}'
  chk "comments list -> 200" 200 GET "/news/$NEWS_ID/comments" "$TOKEN"
fi

# ═══════════════════════════ GUIDES ═══════════════════════════
hdr "GUIDES"
chk "list -> 200" 200 GET /guides "$TOKEN"
chk "create guide USER -> 403" 403 POST /guides "$TOKEN" '{"titleRu":"Как оформить пособие","bodyRu":"Пошаговая инструкция"}'
# создание гайда только ADMIN/MODERATOR — проверим под админом ниже, если есть токен

# ═══════════════════════════ REVIEWS ═══════════════════════════
hdr "REVIEWS"
if [ -n "$ORG_ID" ]; then
  chk "org reviews list -> 200" 200 GET "/organizations/$ORG_ID/reviews" "$TOKEN"
  chk "create org review -> 200/201" 201 POST "/organizations/$ORG_ID/reviews" "$TOKEN" '{"rating":5,"comment":"Отлично"}'
  chk "review rating 6 -> 400" 400 POST "/organizations/$ORG_ID/reviews" "$TOKEN" '{"rating":6}'
fi

# ═══════════════════════════ TICKETS ═══════════════════════════
hdr "TICKETS"
TK=$(body POST /tickets "$TOKEN" '{"subject":"Помощь с документами","body":"Подробное описание ситуации"}')
TID=$(echo "$TK" | jq -r '.id // empty')
[ -n "$TID" ] && ok "create ticket -> id=$TID" || no "create ticket: $TK"
chk "ticket кривой body -> 400" 400 POST /tickets "$TOKEN" '{"subject":"x"}'
chk "my tickets -> 200" 200 GET /tickets/my "$TOKEN"
chk "all tickets USER -> 403" 403 GET /tickets/all "$TOKEN"

# ═══════════════════════════ COMPLAINTS ═══════════════════════════
hdr "COMPLAINTS"
CMP=$(body POST /complaints "$TOKEN" "{\"targetType\":\"organization\",\"targetId\":\"${ORG_ID:-00000000-0000-0000-0000-000000000000}\",\"reason\":\"Неверный адрес\"}")
echo "$CMP" | jq -e '.id' >/dev/null 2>&1 && ok "create complaint" || no "create complaint: $CMP"
chk "complaint кривой targetType -> 400" 400 POST /complaints "$TOKEN" '{"targetType":"wrong","targetId":"x","reason":"abc"}'
chk "my complaints -> 200" 200 GET /complaints/my "$TOKEN"
chk "all complaints USER -> 403" 403 GET /complaints/all "$TOKEN"

# ═══════════════════════════ NOTIFICATIONS ═══════════════════════════
hdr "NOTIFICATIONS"
chk "my -> 200" 200 GET /notifications/my "$TOKEN"
chk "read-all -> 200" 200 PATCH /notifications/my/read-all "$TOKEN"

# ═══════════════════════════ ADMIN (нужен ADMIN-токен) ═══════════════════════════
hdr "ADMIN"
# ATOK уже получен в секции NEWS
if [ -n "$ATOK" ]; then
  ok "admin login ($ADMIN_EMAIL)"
  chk "admin/users -> 200"          200 GET /admin/users "$ATOK"
  chk "admin/organizations -> 200"  200 GET /admin/organizations "$ATOK"
  chk "admin/news -> 200"           200 GET /admin/news "$ATOK"
  chk "admin/news/stats -> 200"     200 GET /admin/news/stats "$ATOK"
  chk "admin/tickets -> 200"        200 GET /admin/tickets "$ATOK"
  chk "admin/complaints -> 200"     200 GET /admin/complaints "$ATOK"
  chk "admin/audit -> 200"          200 GET /admin/audit "$ATOK"
  # создание гайда под админом (USER выше получил 403)
  chk "create guide (ADMIN) -> 201" 201 POST /guides "$ATOK" '{"titleRu":"Как оформить пособие","bodyRu":"Пошаговая инструкция"}'
  # негатив: USER в админку -> 403
  chk "USER -> admin/users -> 403"  403 GET /admin/users "$TOKEN"
else
  no "admin login не удался ($ADMIN_EMAIL) — запусти seed: docker compose exec core-svc npx ts-node prisma/seed.ts"
fi

# ═══════════════════════════ INTERNAL (X-Internal-Key) ═══════════════════════════
hdr "INTERNAL"
if [ -n "$ADMIN_KEY" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$CORE/internal/notifications/broadcast" \
    -H "x-internal-key: $ADMIN_KEY" -H 'Content-Type: application/json' \
    -d '{"title":"Тест","body":"broadcast","type":"system"}')
  if [ "$code" = "200" ] || [ "$code" = "201" ]; then ok "broadcast (key) -> $code"; else no "broadcast -> $code"; fi
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$CORE/internal/notifications/broadcast" \
    -H "x-internal-key: WRONG" -H 'Content-Type: application/json' -d '{"title":"x","body":"y","type":"system"}')
  if [ "$code" = "401" ] || [ "$code" = "403" ]; then ok "broadcast неверный key -> $code"; else no "broadcast wrong key -> $code (ждали 401/403)"; fi
else
  echo "  ⚠ пропуск: задай ADMIN_KEY (из infra/.env), чтобы проверить internal-роуты"
fi

# ═══════════════════════════ ИТОГ ═══════════════════════════
echo; echo "════════════════════════════"
echo "  ✅ прошло: $P    ❌ упало: $F"
echo "════════════════════════════"
