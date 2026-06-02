#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# ЗАКРЫТИЕ ПРОБЕЛОВ core/taxi — то, что не покрыли roles/capabilities/security:
#   1) Платёжный цикл: CASH → мгновенный PAID; KASPI → PENDING+mock-ссылка →
#      confirm → PAID; повторная оплата и оплата отменённой → 400.
#   2) Recurring (авто-расписание): create → list → pause → resume → delete.
#   3) MinIO: ВАЛИДНАЯ загрузка PNG → 200 + url вида .../news/...
#   4) Гонка assignDriver: 2 параллельных назначения на одну заявку →
#      ровно один CONFIRMED (200), второй 400 (updateMany count=0).
#   5) WebSocket handshake (best-effort, нужен node + socket.io-client):
#      валидный токен → connect; мусорный → connect_error.
#
#   bash docs/test_gaps.sh
# Требуется docker (verify email), jq, curl. WS-часть пропускается без node.
# bash 3.2-совместимо (macOS).
# ──────────────────────────────────────────────────────────────────────────
set -u
CORE=http://localhost:3001/api
TAXI=http://localhost:3002
TS=$(date +%s)
PASS="Test1234"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@senimdi.kz}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin2026!}"

P=0; F=0
ok(){ P=$((P+1)); echo "  ✅ $1"; }
no(){ F=$((F+1)); echo "  ❌ $1"; }
hdr(){ echo; echo "══ $1 ══"; }

req(){ # METHOD FULLURL TOKEN BODY -> тело ответа
  local m="$1" url="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"
}
code_of(){ # METHOD FULLURL TOKEN BODY -> http_code
  local m="$1" url="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"
}
jqf(){ echo "$1" | jq -r "$2 // empty"; }
command -v jq >/dev/null     || { echo "нужен jq";     exit 1; }
command -v docker >/dev/null || { echo "нужен docker"; exit 1; }

verify_email(){ docker exec core_db psql -U core_user -d core_db -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$1';" >/dev/null 2>&1; }
make_user(){ # EMAIL FIRST -> token
  local email="$1" first="$2"
  req POST "$CORE/auth/register" "" "{\"email\":\"$email\",\"password\":\"$PASS\",\"firstName\":\"$first\",\"lastName\":\"Т\",\"role\":\"USER\"}" >/dev/null
  verify_email "$email"
  req POST "$CORE/auth/login" "" "{\"email\":\"$email\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty'
}

# ─── токены (2 логина — под лимитом 10/мин) ───
ATOK=$(req POST "$CORE/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.accessToken // empty')
UTOK=$(make_user "gap_u_${TS}@x.com" "Юзер")
[ -n "$ATOK" ] && [ -n "$UTOK" ] || { echo "нет токенов — стоп (возможно лимит логина)"; exit 1; }
ok "токены ADMIN / USER получены"

# helper: создать PENDING-заявку такси от UTOK, вернуть id
mk_booking(){
  req POST "$TAXI/bookings" "$UTOK" '{"fromAddress":"Дом","toAddress":"Клиника","fromLat":43.238,"fromLon":76.889,"toLat":43.25,"toLon":76.96,"scheduledAt":"2026-07-01T09:00:00Z","disabilityType":"WHEELCHAIR"}' | jq -r '.id // empty'
}

# ═══════════════════════════════════════════════════════════════════════════
# 1) ПЛАТЁЖНЫЙ ЦИКЛ
# ═══════════════════════════════════════════════════════════════════════════
hdr "Платежи: CASH (мгновенно PAID)"
B1=$(mk_booking)
[ -n "$B1" ] && ok "заявка для CASH создана id=$B1" || no "заявка CASH не создана"
PAY=$(req POST "$TAXI/bookings/$B1/payment?method=CASH" "$UTOK")
[ "$(jqf "$PAY" '.status')" = "PAID" ] && ok "CASH → status PAID" || no "CASH статус = $(jqf "$PAY" '.status') (ждали PAID)"
CASH_MOCK=$(echo "$PAY" | jq -r '.isMock')
[ "$CASH_MOCK" = "false" ] && ok "CASH → isMock=false" || no "CASH isMock = $CASH_MOCK"
# повторная оплата уже оплаченной → 400
C=$(code_of POST "$TAXI/bookings/$B1/payment?method=CASH" "$UTOK")
[ "$C" = "400" ] && ok "повторная оплата PAID → 400" || no "повторная оплата ($C, ждали 400)"

hdr "Платежи: KASPI (PENDING → confirm → PAID)"
B2=$(mk_booking)
PAY2=$(req POST "$TAXI/bookings/$B2/payment?method=KASPI" "$UTOK")
TXID=$(jqf "$PAY2" '.transactionId')
[ "$(jqf "$PAY2" '.status')" = "PENDING" ] && ok "KASPI → status PENDING" || no "KASPI статус = $(jqf "$PAY2" '.status')"
echo "$PAY2" | jq -e '.paymentUrl | test("kaspi")' >/dev/null 2>&1 && ok "KASPI → mock paymentUrl присутствует" || no "нет mock paymentUrl"
[ "$(jqf "$PAY2" '.isMock')" = "true" ] && ok "KASPI → isMock=true" || no "KASPI isMock = $(jqf "$PAY2" '.isMock')"
# confirm webhook → PAID
CONF=$(req PATCH "$TAXI/bookings/$B2/payment/$TXID/confirm" "$UTOK")
[ "$(jqf "$CONF" '.success')" = "true" ] && ok "confirm webhook → success" || no "confirm = $CONF"
# контроль: повторная оплата теперь → 400 (booking стал PAID)
C=$(code_of POST "$TAXI/bookings/$B2/payment?method=KASPI" "$UTOK")
[ "$C" = "400" ] && ok "после confirm повторная оплата → 400" || no "после confirm ($C, ждали 400)"

hdr "Платежи: нельзя оплатить ОТМЕНЁННУЮ"
B3=$(mk_booking)
req PATCH "$TAXI/bookings/$B3/cancel" "$UTOK" >/dev/null
C=$(code_of POST "$TAXI/bookings/$B3/payment?method=CASH" "$UTOK")
[ "$C" = "400" ] && ok "оплата CANCELLED → 400" || no "оплата CANCELLED ($C, ждали 400)"

# ═══════════════════════════════════════════════════════════════════════════
# 2) RECURRING (авто-расписание)
# ═══════════════════════════════════════════════════════════════════════════
hdr "Recurring: CRUD расписания"
REC=$(req POST "$TAXI/bookings/recurring" "$UTOK" '{"fromAddress":"Дом","toAddress":"Диализ","disabilityType":"WHEELCHAIR","cronExpression":"0 9 * * 1-5"}')
RID=$(jqf "$REC" '.id')
[ -n "$RID" ] && ok "расписание создано id=$RID" || no "расписание не создано ($REC)"
echo "$REC" | jq -e '.nextRunAt' >/dev/null 2>&1 && ok "nextRunAt вычислен" || no "нет nextRunAt"
req GET "$TAXI/bookings/recurring" "$UTOK" | jq -e --arg id "$RID" '.[]?|select(.id==$id)' >/dev/null 2>&1 && ok "расписание в списке GET" || no "расписания нет в списке"
[ "$(code_of PATCH "$TAXI/bookings/recurring/$RID/pause"  "$UTOK")" = "200" ] && ok "pause → 200"  || no "pause не 200"
[ "$(code_of PATCH "$TAXI/bookings/recurring/$RID/resume" "$UTOK")" = "200" ] && ok "resume → 200" || no "resume не 200"
[ "$(code_of DELETE "$TAXI/bookings/recurring/$RID" "$UTOK")" = "200" ] && ok "delete → 200" || no "delete не 200"

# ═══════════════════════════════════════════════════════════════════════════
# 3) MinIO — ВАЛИДНАЯ загрузка PNG
# ═══════════════════════════════════════════════════════════════════════════
hdr "MinIO: валидная загрузка картинки к новости"
NEWS=$(req POST "$CORE/news" "$UTOK" '{"titleRu":"Фото-новость","bodyRu":"Текст"}')
NID=$(jqf "$NEWS" '.id')
# минимальный валидный PNG (1x1, прозрачный)
PNG=$(mktemp /tmp/gap_XXXX.png)
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82' > "$PNG"
UP=$(curl -s -X POST "$CORE/news/$NID/image" -H "Authorization: Bearer $UTOK" -F "file=@${PNG};filename=ok.png;type=image/png")
echo "$UP" | jq -e '.imageUrl // .image // .url' >/dev/null 2>&1 \
  && { echo "$UP" | jq -er '(.imageUrl // .image // .url)|test("/news/")' >/dev/null 2>&1 && ok "PNG загружен, url содержит /news/" || ok "PNG загружен (url есть)"; } \
  || no "валидный PNG не загрузился ($UP)"
rm -f "$PNG"

# ═══════════════════════════════════════════════════════════════════════════
# 4) ГОНКА: два параллельных assignDriver на одну заявку → один CONFIRMED
# ═══════════════════════════════════════════════════════════════════════════
hdr "Гонка: одновременное назначение водителя"
DRV=$(req POST "$TAXI/drivers" "$ATOK" "{\"firstName\":\"Иван\",\"lastName\":\"Гонка\",\"phone\":\"+7700${TS}\",\"licensePlate\":\"GAP ${TS}\",\"vehicleType\":\"WHEELCHAIR_VAN\"}")
DID=$(jqf "$DRV" '.id')
B4=$(mk_booking)
if [ -n "$DID" ] && [ -n "$B4" ]; then
  ok "водитель id=$DID и заявка id=$B4 готовы"
  RACE=$(mktemp /tmp/gap_race_XXXX)
  for i in 1 2; do
    ( curl -s -o /dev/null -w "%{http_code}\n" -X PATCH "$TAXI/manager/bookings/$B4/assign" \
        -H "Authorization: Bearer $ATOK" -H 'Content-Type: application/json' \
        -d "{\"driverId\":\"$DID\"}" >> "$RACE" ) &
  done
  wait
  OKC=$(grep -c '^200$' "$RACE")
  BADC=$(grep -c '^400$' "$RACE")
  [ "$OKC" = "1" ] && ok "ровно один assign → 200 (CONFIRMED)" || no "200-ответов: $OKC (ждали 1)"
  [ "$BADC" = "1" ] && ok "второй assign → 400 (гонка отбита)" || no "400-ответов: $BADC (ждали 1)"
  # контроль: заявка реально CONFIRMED
  ST=$(req GET "$TAXI/bookings/$B4" "$UTOK" | jq -r '.status // "?"')
  [ "$ST" = "CONFIRMED" ] && ok "итоговый статус заявки CONFIRMED" || no "статус = $ST"
  rm -f "$RACE"
else
  no "не удалось подготовить водителя/заявку для гонки"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 5) WEBSOCKET handshake (best-effort: нужен node + socket.io-client)
# ═══════════════════════════════════════════════════════════════════════════
hdr "WebSocket: JWT на handshake"
if command -v node >/dev/null && node -e "require('socket.io-client')" >/dev/null 2>&1; then
  RES=$(UTOK="$UTOK" node - <<'NODE'
const { io } = require('socket.io-client');
const URL = 'http://localhost:3002/taxi';
function test(token){
  return new Promise((resolve)=>{
    const s = io(URL, { auth:{ token }, transports:['websocket'], reconnection:false, timeout:4000 });
    const done = (r)=>{ try{s.close();}catch(e){} resolve(r); };
    s.on('connect', ()=>done('connect'));
    s.on('connect_error', ()=>done('error'));
    setTimeout(()=>done('timeout'), 4500);
  });
}
(async()=>{
  const good = await test(process.env.UTOK);
  const bad  = await test('garbage.invalid.token');
  console.log(`${good} ${bad}`);
  process.exit(0);
})();
NODE
)
  GOOD=$(echo "$RES" | awk '{print $1}')
  BAD=$(echo "$RES"  | awk '{print $2}')
  [ "$GOOD" = "connect" ] && ok "валидный токен → connect" || no "валидный токен → $GOOD (ждали connect)"
  [ "$BAD" = "error" ]    && ok "мусорный токен → connect_error" || no "мусорный токен → $BAD (ждали error)"
else
  echo "  ⏭️  WS пропущен: нет node или socket.io-client (npm i socket.io-client)"
fi

echo
echo "════════════════════════════"
echo "  ✅ прошло: $P    ❌ упало: $F"
echo "════════════════════════════"
