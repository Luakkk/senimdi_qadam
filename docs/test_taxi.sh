#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# Полная проверка эндпоинтов TAXI-SVC на поднятом стенде.
# Бьём напрямую в taxi (:3002) — изолируем сервис от шлюза.
# taxi-svc НЕ имеет globalPrefix; /health зарегистрирован вручную.
# JWT_SECRET общий с core-svc → токены из core валидны здесь.
#
#   bash docs/test_taxi.sh
#   ADMIN_EMAIL=... ADMIN_PASSWORD=... bash docs/test_taxi.sh
#
# Токены берутся из core-svc (:3001): USER — через register, ADMIN — login.
# bash 3.2-совместимо (macOS).
# ──────────────────────────────────────────────────────────────────────────
set -u
TAXI=http://localhost:3002
CORE=http://localhost:3001/api
TS=$(date +%s)
EMAIL="taxi_${TS}@example.com"
EMAIL2="taxi2_${TS}@example.com"
PASS="Test1234"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@senimdi.kz}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin2026!}"

P=0; F=0
ok(){   P=$((P+1)); echo "  ✅ $1"; }
no(){   F=$((F+1)); echo "  ❌ $1"; }
hdr(){ echo; echo "══ $1 ══"; }

# chk LABEL EXPECTED METHOD PATH [TOKEN] [JSONBODY]  — бьёт в $TAXI$path
chk(){
  local label="$1" exp="$2" m="$3" path="$4" tok="${5:-}" body="${6:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$TAXI$path")
  [ -n "$tok" ]  && args+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local code; code=$(curl "${args[@]}")
  if [ "$code" = "$exp" ]; then ok "$label ($m $path -> $code)"
  else no "$label ($m $path -> $code, ждали $exp)"; fi
}
# тело ответа (taxi)
tbody(){ # METHOD PATH TOKEN JSONBODY
  local m="$1" path="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -X "$m" "$TAXI$path")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"
}
# тело ответа (core) — для получения токенов
cbody(){ # METHOD PATH TOKEN JSONBODY
  local m="$1" path="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -X "$m" "$CORE$path")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"
}
command -v jq >/dev/null || { echo "нужен jq (brew install jq)"; exit 1; }

# ═══════════════════════ ТОКЕНЫ (из core-svc) ═══════════════════════
hdr "ТОКЕНЫ (core-svc)"
REG=$(cbody POST /auth/register "" "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"firstName\":\"Такси\",\"lastName\":\"Юзер\",\"role\":\"USER\"}")
TOKEN=$(echo "$REG" | jq -r '.accessToken // empty')
[ -n "$TOKEN" ] && ok "USER токен получен" || { no "register USER: $REG"; echo "стоп"; exit 1; }
REG2=$(cbody POST /auth/register "" "{\"email\":\"$EMAIL2\",\"password\":\"$PASS\",\"firstName\":\"Менеджер\",\"lastName\":\"Кандидат\",\"role\":\"USER\"}")
TOKEN2=$(echo "$REG2" | jq -r '.accessToken // empty')
[ -n "$TOKEN2" ] && ok "2-й USER токен (для manager-auth)" || no "register USER2: $REG2"
ALOG=$(cbody POST /auth/login "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ATOK=$(echo "$ALOG" | jq -r '.accessToken // empty')
[ -n "$ATOK" ] && ok "ADMIN токен получен" || no "admin login: $ALOG"

# ═══════════════════════ HEALTH ═══════════════════════
hdr "HEALTH"
chk "health -> 200" 200 GET /health

# ═══════════════════════ BOOKINGS ═══════════════════════
hdr "BOOKINGS"
chk "estimate-price -> 200" 200 GET "/bookings/estimate-price?fromLat=43.238&fromLon=76.889&toLat=43.25&toLon=76.96&disabilityType=WHEELCHAIR" "$TOKEN"
chk "create без токена -> 401" 401 POST /bookings "" '{"fromAddress":"A","toAddress":"B","scheduledAt":"2026-06-10T10:00:00Z","disabilityType":"WHEELCHAIR"}'
chk "create кривой body -> 400" 400 POST /bookings "$TOKEN" '{"fromAddress":"A"}'
BK=$(tbody POST /bookings "$TOKEN" '{"fromAddress":"ул. Абая 1","toAddress":"ул. Достык 10","fromLat":43.238,"fromLon":76.889,"toLat":43.25,"toLon":76.96,"scheduledAt":"2026-06-10T10:00:00Z","disabilityType":"WHEELCHAIR","note":"подъёмник"}')
BID=$(echo "$BK" | jq -r '.id // empty')
[ -n "$BID" ] && ok "create booking -> id=$BID (PENDING)" || no "create booking: $BK"
chk "my bookings -> 200" 200 GET /bookings/my "$TOKEN"
[ -n "$BID" ] && chk "booking :id -> 200" 200 GET "/bookings/$BID" "$TOKEN"
[ -n "$BID" ] && chk "driver-location (нет водителя) -> 200" 200 GET "/bookings/$BID/driver-location" "$TOKEN"

# ═══════════════════════ DRIVERS ═══════════════════════
hdr "DRIVERS"
chk "list (публичный) -> 200" 200 GET /drivers
chk "create driver USER -> 403" 403 POST /drivers "$TOKEN" "{\"firstName\":\"И\",\"lastName\":\"П\",\"phone\":\"+7700${TS}\",\"licensePlate\":\"X${TS}\"}"
DRV=$(tbody POST /drivers "$ATOK" "{\"firstName\":\"Иван\",\"lastName\":\"Петров\",\"phone\":\"+7701${TS}\",\"licensePlate\":\"777T${TS}\",\"vehicleType\":\"WHEELCHAIR_VAN\"}")
DID=$(echo "$DRV" | jq -r '.id // empty')
[ -n "$DID" ] && ok "create driver (ADMIN) -> id=$DID (ACTIVE)" || no "create driver: $DRV"
[ -n "$DID" ] && chk "driver :id -> 200" 200 GET "/drivers/$DID"
[ -n "$DID" ] && chk "driver setStatus (ADMIN) -> 200" 200 PATCH "/drivers/$DID/status?status=ACTIVE" "$ATOK"

# ═══════════════════════ MANAGER ═══════════════════════
hdr "MANAGER"
chk "stats USER -> 403"  403 GET /manager/stats "$TOKEN"
chk "stats (ADMIN) -> 200"            200 GET /manager/stats "$ATOK"
chk "queue (ADMIN) -> 200"            200 GET /manager/queue "$ATOK"
chk "drivers/available (ADMIN) -> 200" 200 GET /manager/drivers/available "$ATOK"
chk "bookings (ADMIN) -> 200"         200 GET /manager/bookings "$ATOK"
[ -n "$BID" ] && chk "booking detail (ADMIN) -> 200" 200 GET "/manager/bookings/$BID" "$ATOK"
# полный жизненный цикл заявки
if [ -n "$BID" ] && [ -n "$DID" ]; then
  chk "assign driver -> CONFIRMED -> 200"        200 PATCH "/manager/bookings/$BID/assign" "$ATOK" "{\"driverId\":\"$DID\"}"
  chk "status IN_PROGRESS -> 200"                200 PATCH "/manager/bookings/$BID/status" "$ATOK" '{"status":"IN_PROGRESS"}'
  chk "status COMPLETED -> 200"                  200 PATCH "/manager/bookings/$BID/status" "$ATOK" '{"status":"COMPLETED"}'
  chk "недопустимый переход COMPLETED->PENDING -> 400" 400 PATCH "/manager/bookings/$BID/status" "$ATOK" '{"status":"PENDING"}'
fi

# ═══════════════════════ REVIEWS ═══════════════════════
hdr "REVIEWS (после COMPLETED)"
if [ -n "$BID" ]; then
  chk "review -> 201"            201 POST "/drivers/bookings/$BID/review" "$TOKEN" '{"rating":5,"comment":"Отлично"}'
  chk "review дубль -> 409"      409 POST "/drivers/bookings/$BID/review" "$TOKEN" '{"rating":4}'
  chk "review rating 6 -> 400"   400 POST "/drivers/bookings/$BID/review" "$TOKEN" '{"rating":6}'
fi

# ═══════════════════════ CHAT ═══════════════════════
hdr "CHAT"
if [ -n "$BID" ]; then
  chk "user send msg -> 201"     201 POST "/chat/bookings/$BID/messages" "$TOKEN" '{"text":"Когда приедет водитель?"}'
  chk "user get msgs -> 200"     200 GET  "/chat/bookings/$BID/messages" "$TOKEN"
  chk "user unread -> 200"       200 GET  /chat/unread "$TOKEN"
  chk "manager send msg -> 201"  201 POST "/chat/manager/bookings/$BID/messages" "$ATOK" '{"text":"В 14:30"}'
  chk "manager get msgs -> 200"  200 GET  "/chat/manager/bookings/$BID/messages" "$ATOK"
  chk "manager unread -> 200"    200 GET  /chat/manager/unread "$ATOK"
  chk "USER -> manager unread -> 403" 403 GET /chat/manager/unread "$TOKEN"
fi

# ═══════════════════════ RECURRING ═══════════════════════
hdr "RECURRING"
RC=$(tbody POST /bookings/recurring "$TOKEN" '{"fromAddress":"Дом","toAddress":"Поликлиника","disabilityType":"WHEELCHAIR","cronExpression":"0 9 * * 1-5"}')
RID=$(echo "$RC" | jq -r '.id // empty')
[ -n "$RID" ] && ok "create recurring -> id=$RID" || no "create recurring: $RC"
chk "my recurring -> 200" 200 GET /bookings/recurring "$TOKEN"
if [ -n "$RID" ]; then
  chk "pause -> 200"  200 PATCH "/bookings/recurring/$RID/pause"  "$TOKEN"
  chk "resume -> 200" 200 PATCH "/bookings/recurring/$RID/resume" "$TOKEN"
  chk "delete -> 200" 200 DELETE "/bookings/recurring/$RID" "$TOKEN"
fi

# ═══════════════════════ MANAGER-AUTH ═══════════════════════
hdr "MANAGER-AUTH"
chk "invite USER -> 403" 403 POST /manager-auth/invite "$TOKEN"
INV=$(tbody POST /manager-auth/invite "$ATOK")
CODE=$(echo "$INV" | jq -r '.code // empty')
[ -n "$CODE" ] && ok "generate invite (ADMIN) -> $CODE" || no "invite: $INV"
chk "invites list (ADMIN) -> 200" 200 GET /manager-auth/invites "$ATOK"
if [ -n "$CODE" ] && [ -n "$TOKEN2" ]; then
  chk "register manager (invite) -> 201" 201 POST /manager-auth/register "$TOKEN2" "{\"inviteCode\":\"$CODE\",\"firstName\":\"Айгерим\",\"lastName\":\"С\",\"phone\":\"+77011112233\"}"
  chk "manager me -> 200" 200 GET /manager-auth/me "$TOKEN2"
  chk "register повторно (код использован) -> 400" 400 POST /manager-auth/register "$TOKEN2" "{\"inviteCode\":\"$CODE\",\"firstName\":\"A\",\"lastName\":\"B\",\"phone\":\"+77011112233\"}"
fi

echo
echo "════════════════════════════"
echo "  ✅ прошло: $P    ❌ упало: $F"
echo "════════════════════════════"
