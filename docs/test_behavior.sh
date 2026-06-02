#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# ПОВЕДЕНЧЕСКИЕ ТЕСТЫ core/taxi — не «доступность эндпоинта», а реальная логика:
#   1. Полный жизненный цикл брони   PENDING→CONFIRMED→IN_PROGRESS→COMPLETED
#                                     + запрет невалидного перехода (400)
#   2. CARD-оплата (ветка initiatePayment, которую раньше не трогали)
#   3. confirmPayment — проверка ownership (потенциальная дыра: чужой подтверждает оплату)
#   4. Throttle: 11-й логин за минуту → 429
#   5. logout реально инвалидирует refresh (старый refresh → 401)
#   6. Полный 2FA TOTP-цикл: setup → verify настоящим кодом → login с кодом → disable
#   7. Чат happy-path: user→manager, manager→user, счётчики unread
#   8. Recurring @Cron реально СОЗДАЁТ бронь, когда nextRunAt прошёл
#   9. Driver review после COMPLETED поездки
#
#   bash docs/test_behavior.sh
# Требуется: docker, jq, curl, node (для TOTP — берём speakeasy из core-svc).
# ВНИМАНИЕ: п.4 делает ~12 логинов → запускать ОТДЕЛЬНО от других скриптов,
#           иначе упрётесь в общий лимит 10/мин по IP.
# ──────────────────────────────────────────────────────────────────────────
set -u
CORE=http://localhost:3001/api
TAXI=http://localhost:3002
TS=$(date +%s)
PASS="Test1234"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@senimdi.kz}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin2026!}"

# repo root = на уровень выше docs/  (для node speakeasy)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
SPEAKEASY="$REPO/services/core-svc/node_modules/speakeasy"

P=0; F=0
ok(){ P=$((P+1)); echo "  ✅ $1"; }
no(){ F=$((F+1)); echo "  ❌ $1"; }
hdr(){ echo; echo "══ $1 ══"; }

req(){ local m="$1" url="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"; }
code(){ local m="$1" url="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"; }

command -v jq    >/dev/null || { echo "нужен jq";    exit 1; }
command -v docker>/dev/null || { echo "нужен docker";exit 1; }
command -v node  >/dev/null || { echo "нужен node";  exit 1; }
[ -d "$SPEAKEASY" ] || { echo "не найден speakeasy: $SPEAKEASY (npm i в core-svc)"; exit 1; }

cdb(){ docker exec core_db psql -U core_user -d core_db "$@"; }
tdb(){ docker exec taxi_db psql -U taxi_user -d taxi_db "$@"; }
verify_email(){ cdb -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$1';" >/dev/null 2>&1; }
login(){ req POST "$CORE/auth/login" "" "{\"email\":\"$1\",\"password\":\"$PASS\"}"; }
make_user(){ local email="$1" first="$2"
  req POST "$CORE/auth/register" "" "{\"email\":\"$email\",\"password\":\"$PASS\",\"firstName\":\"$first\",\"lastName\":\"Т\",\"role\":\"USER\"}" >/dev/null
  verify_email "$email"; }
totp(){ node -e "console.log(require(process.argv[1]).totp({secret:process.argv[2],encoding:'base32'}))" "$SPEAKEASY" "$1"; }

# ─── участники ───────────────────────────────────────────────────────────
ATOK=$(req POST "$CORE/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.accessToken // empty')
[ -n "$ATOK" ] || { echo "не залогинить admin — проверь creds"; exit 1; }

U1="beh_u1_${TS}@x.com";  make_user "$U1" "Юзер1"
U2="beh_u2_${TS}@x.com";  make_user "$U2" "Юзер2"
MGR="beh_mgr_${TS}@x.com"; make_user "$MGR" "Менеджер"
# повышаем до TAXI_MANAGER напрямую в core_db (taxi читает роль из JWT → нужен свежий логин)
cdb -c "UPDATE \"User\" SET role='TAXI_MANAGER' WHERE email='$MGR';" >/dev/null 2>&1

U1TOK=$(login "$U1"  | jq -r '.accessToken // empty')
U2TOK=$(login "$U2"  | jq -r '.accessToken // empty')
MTOK=$(login "$MGR"  | jq -r '.accessToken // empty')   # JWT уже содержит TAXI_MANAGER

# ═══════════════════════════════════════════════════════════════════════════
hdr "1. ЖИЗНЕННЫЙ ЦИКЛ БРОНИ (PENDING→CONFIRMED→IN_PROGRESS→COMPLETED)"
BK=$(req POST "$TAXI/bookings" "$U1TOK" \
  '{"fromAddress":"Абая 1","toAddress":"Достык 10","fromLat":43.238,"fromLon":76.945,"toLat":43.25,"toLon":76.96,"scheduledAt":"2026-12-01T10:00:00Z","disabilityType":"WHEELCHAIR"}')
BID=$(echo "$BK" | jq -r '.id // empty')
ST=$(echo "$BK" | jq -r '.status // empty')
[ -n "$BID" ] && ok "создана бронь ($ST)" || no "бронь не создалась: $BK"
[ "$ST" = "PENDING" ] && ok "статус = PENDING" || no "статус = $ST (ждали PENDING)"

# водитель для назначения
DRV=$(req POST "$TAXI/drivers" "$MTOK" \
  "{\"firstName\":\"Вод\",\"lastName\":\"Т\",\"phone\":\"+7700${TS:5:6}\",\"licensePlate\":\"BEH${TS:7:3}KZ\"}")
DID=$(echo "$DRV" | jq -r '.id // empty')
[ -n "$DID" ] && ok "создан водитель" || no "водитель не создался: $DRV"

# assign → CONFIRMED
ASG=$(req PATCH "$TAXI/manager/bookings/$BID/assign" "$MTOK" "{\"driverId\":\"$DID\"}")
[ "$(echo "$ASG" | jq -r '.status')" = "CONFIRMED" ] && ok "assign → CONFIRMED" || no "assign: $ASG"
# IN_PROGRESS
c=$(code PATCH "$TAXI/manager/bookings/$BID/status" "$MTOK" '{"status":"IN_PROGRESS"}')
[ "$c" = "200" ] && ok "CONFIRMED→IN_PROGRESS (200)" || no "IN_PROGRESS ($c)"
# COMPLETED
c=$(code PATCH "$TAXI/manager/bookings/$BID/status" "$MTOK" '{"status":"COMPLETED"}')
[ "$c" = "200" ] && ok "IN_PROGRESS→COMPLETED (200)" || no "COMPLETED ($c)"
# невалидный переход COMPLETED→IN_PROGRESS → 400 (после фикса; раньше отдавал 403)
c=$(code PATCH "$TAXI/manager/bookings/$BID/status" "$MTOK" '{"status":"IN_PROGRESS"}')
[ "$c" = "400" ] && ok "COMPLETED→IN_PROGRESS запрещён (400)" || no "невалидный переход вернул $c (ждали 400)"

# ═══════════════════════════════════════════════════════════════════════════
hdr "2. CARD-ОПЛАТА + 3. confirmPayment OWNERSHIP"
BK2=$(req POST "$TAXI/bookings" "$U1TOK" \
  '{"fromAddress":"A","toAddress":"B","scheduledAt":"2026-12-02T10:00:00Z","disabilityType":"OTHER"}')
BID2=$(echo "$BK2" | jq -r '.id')
PAY=$(req POST "$TAXI/bookings/$BID2/payment?method=CARD" "$U1TOK" "")
PST=$(echo "$PAY" | jq -r '.status'); PMOCK=$(echo "$PAY" | jq -r '.isMock'); TXID=$(echo "$PAY" | jq -r '.transactionId')
[ "$PST" = "PENDING" ] && ok "CARD → PENDING" || no "CARD статус = $PST"
[ "$PMOCK" = "true" ]  && ok "CARD → isMock=true" || no "CARD isMock = $PMOCK"
[ -n "$TXID" ] && [ "$TXID" != "null" ] && ok "CARD → transactionId выдан" || no "нет transactionId"

# ⚠ ownership: ЧУЖОЙ пользователь (U2) подтверждает оплату брони U1
c=$(code PATCH "$TAXI/bookings/$BID2/payment/$TXID/confirm" "$U2TOK" "")
if [ "$c" = "403" ] || [ "$c" = "404" ]; then
  ok "чужой не может подтвердить оплату ($c)"
else
  no "ДЫРА: чужой подтвердил чужую оплату ($c) — confirmPayment без ownership-проверки (фикс: where userId)"
fi
# владелец подтверждает — должно работать
c=$(code PATCH "$TAXI/bookings/$BID2/payment/$TXID/confirm" "$U1TOK" "")
[ "$c" = "200" ] && ok "владелец подтвердил оплату (200)" || no "владелец: confirm вернул $c"

# ═══════════════════════════════════════════════════════════════════════════
hdr "4. THROTTLE — 11-й логин за минуту → 429"
THR_HIT=0
for i in $(seq 1 12); do
  c=$(code POST "$CORE/auth/login" "" "{\"email\":\"nouser_${TS}@x.com\",\"password\":\"x\"}")
  [ "$c" = "429" ] && { THR_HIT=1; break; }
done
[ "$THR_HIT" = "1" ] && ok "rate-limit сработал (429)" || no "за 12 попыток 429 не получили"
echo "  (ждём 60с сброса throttle перед следующими логинами…)"; sleep 62

# ═══════════════════════════════════════════════════════════════════════════
hdr "5. LOGOUT инвалидирует refresh"
LOG=$(login "$U2")
RT=$(echo "$LOG" | jq -r '.refreshToken // empty')
AT=$(echo "$LOG" | jq -r '.accessToken // empty')
# refresh работает ДО logout
c=$(code POST "$CORE/auth/refresh" "" "{\"refreshToken\":\"$RT\"}")
[ "$c" = "200" ] || [ "$c" = "201" ] && ok "refresh до logout ($c)" || no "refresh до logout вернул $c"
# logout (нужен свежий access — refresh выше его ротировал, поэтому логинимся заново)
LOG2=$(login "$U2"); AT2=$(echo "$LOG2" | jq -r '.accessToken'); RT2=$(echo "$LOG2" | jq -r '.refreshToken')
code POST "$CORE/auth/logout" "$AT2" "" >/dev/null
c=$(code POST "$CORE/auth/refresh" "" "{\"refreshToken\":\"$RT2\"}")
[ "$c" = "401" ] && ok "refresh после logout → 401" || no "refresh после logout вернул $c (ждали 401)"

# ═══════════════════════════════════════════════════════════════════════════
hdr "6. ПОЛНЫЙ 2FA TOTP-ЦИКЛ"
A1TOK=$(login "$U1" | jq -r '.accessToken')
SET=$(req POST "$CORE/auth/2fa/setup" "$A1TOK" "")
SECRET=$(echo "$SET" | jq -r '.secret // empty')
[ -n "$SECRET" ] && ok "2fa/setup выдал secret" || no "нет secret: $SET"
CODE1=$(totp "$SECRET")
c=$(code POST "$CORE/auth/2fa/verify" "$A1TOK" "{\"token\":\"$CODE1\"}")
[ "$c" = "200" ] || [ "$c" = "201" ] && ok "2fa/verify настоящим кодом ($c)" || no "verify вернул $c"
# теперь логин без кода → должен требовать 2FA (не выдать токены)
L=$(login "$U1")
NEED=$(echo "$L" | jq -r '.requiresTwoFactor // .requires2fa // empty')
HASTOK=$(echo "$L" | jq -r '.accessToken // empty')
if [ -z "$HASTOK" ]; then ok "логин без кода не выдал токены (2FA требуется)"; else no "логин без кода выдал токены — 2FA не enforced"; fi
# логин С кодом
CODE2=$(totp "$SECRET")
L2=$(req POST "$CORE/auth/login" "" "{\"email\":\"$U1\",\"password\":\"$PASS\",\"totpCode\":\"$CODE2\"}")
[ -n "$(echo "$L2" | jq -r '.accessToken // empty')" ] && ok "логин с TOTP-кодом выдал токены" || no "логин с кодом не сработал: $L2"
# disable
A1b=$(echo "$L2" | jq -r '.accessToken'); CODE3=$(totp "$SECRET")
c=$(code POST "$CORE/auth/2fa/disable" "$A1b" "{\"token\":\"$CODE3\"}")
[ "$c" = "200" ] || [ "$c" = "201" ] && ok "2fa/disable ($c)" || no "disable вернул $c"

# ═══════════════════════════════════════════════════════════════════════════
hdr "7. ЧАТ happy-path + unread"
# user→manager  (DTO-поле = text)
c=$(code POST "$TAXI/chat/bookings/$BID/messages" "$U1TOK" '{"text":"Здравствуйте, когда машина?"}')
[ "$c" = "200" ] || [ "$c" = "201" ] && ok "user→manager отправлено ($c)" || no "user msg вернул $c"
# у менеджера должен быть unread > 0  (эндпоинт отдаёт голое число)
UNR=$(req GET "$TAXI/chat/manager/unread" "$MTOK" | tr -dc '0-9')
[ -n "$UNR" ] && [ "$UNR" -gt 0 ] && ok "manager unread = $UNR" || no "manager unread = '$UNR' (ждали >0)"
# manager читает → сообщения
c=$(code GET "$TAXI/chat/manager/bookings/$BID/messages" "$MTOK")
[ "$c" = "200" ] && ok "manager читает чат (200)" || no "manager чтение $c"
# manager→user
c=$(code POST "$TAXI/chat/manager/bookings/$BID/messages" "$MTOK" '{"text":"Через 5 минут"}')
[ "$c" = "200" ] || [ "$c" = "201" ] && ok "manager→user отправлено ($c)" || no "manager msg вернул $c"
# чужой (U2) не должен видеть чат брони U1
c=$(code GET "$TAXI/chat/bookings/$BID/messages" "$U2TOK")
[ "$c" = "403" ] || [ "$c" = "404" ] && ok "чужой не видит чужой чат ($c)" || no "чужой получил чат ($c)"

# ═══════════════════════════════════════════════════════════════════════════
hdr "9. DRIVER REVIEW после COMPLETED (бронь #1 уже COMPLETED, водитель назначен)"
c=$(code POST "$TAXI/drivers/bookings/$BID/review" "$U1TOK" '{"rating":5,"comment":"Отличный водитель"}')
[ "$c" = "200" ] || [ "$c" = "201" ] && ok "отзыв о водителе после поездки ($c)" || no "review вернул $c"
# повторный отзыв → 400/409
c=$(code POST "$TAXI/drivers/bookings/$BID/review" "$U1TOK" '{"rating":4}')
[ "$c" = "400" ] || [ "$c" = "409" ] && ok "повторный отзыв отклонён ($c)" || no "повторный отзыв вернул $c"

# ═══════════════════════════════════════════════════════════════════════════
hdr "8. RECURRING @Cron реально создаёт бронь"
REC=$(req POST "$TAXI/bookings/recurring" "$U1TOK" \
  '{"fromAddress":"Дом","toAddress":"Центр реабилитации","disabilityType":"WHEELCHAIR","cronExpression":"0 9 * * *"}')
RID=$(echo "$REC" | jq -r '.id // empty')
[ -n "$RID" ] && ok "создано расписание" || no "расписание не создалось: $REC"
# принудительно делаем его «просроченным»
tdb -c "UPDATE \"RecurringBooking\" SET \"nextRunAt\"=now()-interval '2 minutes', \"isActive\"=true WHERE id='$RID';" >/dev/null 2>&1
cnt_auto(){ req GET "$TAXI/bookings/my" "$U1TOK" \
  | jq '[.items[]|select((.note//"")|test("Авто-расписание"))]|length' 2>/dev/null; }
BEFORE=$(cnt_auto); BEFORE=${BEFORE:-0}
echo "  ждём тика крона (до 75с)…"; sleep 75
AFTER=$(cnt_auto); AFTER=${AFTER:-0}
if [ "${AFTER:-0}" -gt "${BEFORE:-0}" ]; then ok "крон создал авто-бронь (${BEFORE:-0} -> ${AFTER:-0})"; else no "авто-бронь не создалась (${BEFORE:-0} -> ${AFTER:-0})"; fi

# ═══════════════════════════════════════════════════════════════════════════
echo; echo "════════════════════════════════════════"
echo "ИТОГ: $P passed / $F failed"
[ "$F" = "0" ] && echo "🟢 все поведенческие проверки прошли" || echo "🔴 есть провалы — см. выше"
