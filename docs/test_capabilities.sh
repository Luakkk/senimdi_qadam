#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# Функциональная проверка ВОЗМОЖНОСТЕЙ каждой роли (не только доступа к роуту,
# а что роль реально делает то, что задумано — с настоящим токеном роли).
#
#   ADMIN        — управление пользователями, организациями, модерация, тикеты,
#                  жалобы, аудит, гайды.
#   MODERATOR    — модерация новостей и комментариев; видит юзеров; НЕ может
#                  удалять/менять роли (только ADMIN).
#   ORG_MANAGER  — своя организация: профиль, услуги (CRUD), аналитика.
#   TAXI_MANAGER — очередь, водители, НАЗНАЧЕНИЕ водителя клиенту, смена статусов,
#                  ЧАТ с клиентом (полный диалог в обе стороны).
#
#   bash docs/test_capabilities.sh
# Требуется docker (подтверждение email, смена роли в core_db).
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

chk(){ # LABEL EXPECTED METHOD FULLURL [TOKEN] [BODY]
  local label="$1" exp="$2" m="$3" url="$4" tok="${5:-}" body="${6:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$url")
  [ -n "$tok" ]  && args+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local code; code=$(curl "${args[@]}")
  if [ "$code" = "$exp" ]; then ok "$label ($code)"; else no "$label ($code, ждали $exp)"; fi
}
req(){ # METHOD FULLURL TOKEN BODY -> тело ответа
  local m="$1" url="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"
}
jqf(){ echo "$1" | jq -r "$2 // empty"; }
command -v jq >/dev/null     || { echo "нужен jq";     exit 1; }
command -v docker >/dev/null || { echo "нужен docker"; exit 1; }

verify_email(){ docker exec core_db psql -U core_user -d core_db -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$1';" >/dev/null 2>&1; }
make_user(){ # EMAIL FIRST -> token; userId в NEW_UID
  local email="$1" first="$2" reg
  reg=$(req POST "$CORE/auth/register" "" "{\"email\":\"$email\",\"password\":\"$PASS\",\"firstName\":\"$first\",\"lastName\":\"Т\",\"role\":\"USER\"}")
  verify_email "$email"
  NEW_UID=$(docker exec core_db psql -U core_user -d core_db -tAc "SELECT id FROM \"User\" WHERE email='$email';" 2>/dev/null | tr -d '[:space:]')
  req POST "$CORE/auth/login" "" "{\"email\":\"$email\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty'
}
login(){ req POST "$CORE/auth/login" "" "{\"email\":\"$1\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty'; }
role_of(){ req GET "$CORE/auth/me" "$1" | jq -r '.role // "?"'; }
# id юзера по email — выполняется в РОДИТЕЛЬСКОЙ оболочке (не в subshell)
uid_of(){ docker exec core_db psql -U core_user -d core_db -tAc "SELECT id FROM \"User\" WHERE email='$1';" 2>/dev/null | tr -d '[:space:]'; }

# ─── базовые токены ───
ATOK=$(req POST "$CORE/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.accessToken // empty')
CLIENT=$(make_user "cap_client_${TS}@x.com" "Клиент"); CLIENT_UID=$(uid_of "cap_client_${TS}@x.com")
[ -n "$ATOK" ] && [ -n "$CLIENT" ] || { echo "нет базовых токенов — стоп"; exit 1; }

# ═══════════════════════════════════════════════════════════════════════════
# ADMIN — полный набор
# ═══════════════════════════════════════════════════════════════════════════
hdr "ADMIN: пользователи"
chk "список юзеров"            200 GET "$CORE/admin/users" "$ATOK"
chk "карточка юзера"           200 GET "$CORE/admin/users/$CLIENT_UID" "$ATOK"
chk "бан юзера"                200 PATCH "$CORE/admin/users/$CLIENT_UID/ban" "$ATOK"
chk "разбан юзера"             200 PATCH "$CORE/admin/users/$CLIENT_UID/ban" "$ATOK"

hdr "ADMIN: организации"
ORGA=$(req POST "$CORE/admin/organizations" "$ATOK" '{"nameRu":"Центр Реабилитации","category":"REHABILITATION","city":"Алматы"}')
OID=$(jqf "$ORGA" '.id')
[ -n "$OID" ] && ok "создал организацию id=$OID" || no "create org: $ORGA"
[ -n "$OID" ] && chk "верификация орг → VERIFIED" 200 PATCH "$CORE/admin/organizations/$OID/verify" "$ATOK" '{"method":"call","statusTo":"VERIFIED"}'
[ -n "$OID" ] && chk "логи модерации орг"          200 GET   "$CORE/admin/organizations/$OID/logs" "$ATOK"
chk "список орг (admin)"        200 GET "$CORE/admin/organizations" "$ATOK"

hdr "ADMIN: новости (модерация)"
NEWSA=$(req POST "$CORE/news" "$CLIENT" '{"titleRu":"Новость клиента","bodyRu":"Текст для модерации админом"}')
NID=$(jqf "$NEWSA" '.id')
[ -n "$NID" ] && ok "клиент создал новость id=$NID (PENDING)" || no "create news: $NEWSA"
[ -n "$NID" ] && chk "админ публикует новость" 200 PATCH "$CORE/admin/news/$NID/moderate" "$ATOK" '{"status":"PUBLISHED"}'
chk "статистика новостей"      200 GET "$CORE/admin/news/stats" "$ATOK"

hdr "ADMIN: тикеты"
TKT=$(req POST "$CORE/tickets" "$CLIENT" '{"subject":"Не работает кнопка","body":"Подробное описание проблемы"}')
TID=$(jqf "$TKT" '.id')
[ -n "$TID" ] && ok "клиент создал тикет id=$TID" || no "create ticket: $TKT"
chk "админ видит тикеты"        200 GET "$CORE/admin/tickets" "$ATOK"
[ -n "$TID" ] && chk "тикет → IN_PROGRESS" 200 PATCH "$CORE/admin/tickets/$TID" "$ATOK" '{"status":"IN_PROGRESS"}'
[ -n "$TID" ] && chk "тикет → RESOLVED"    200 PATCH "$CORE/admin/tickets/$TID" "$ATOK" '{"status":"RESOLVED"}'

hdr "ADMIN: жалобы"
CMP=$(req POST "$CORE/complaints" "$CLIENT" "{\"targetType\":\"organization\",\"targetId\":\"${OID:-00000000-0000-0000-0000-000000000000}\",\"reason\":\"Неверный адрес\"}")
CID=$(jqf "$CMP" '.id')
[ -n "$CID" ] && ok "клиент создал жалобу id=$CID" || no "create complaint: $CMP"
chk "админ видит жалобы"        200 GET "$CORE/admin/complaints" "$ATOK"
[ -n "$CID" ] && chk "жалоба → UNDER_REVIEW" 200 PATCH "$CORE/admin/complaints/$CID" "$ATOK" '{"status":"UNDER_REVIEW"}'
[ -n "$CID" ] && chk "жалоба → RESOLVED"     200 PATCH "$CORE/admin/complaints/$CID" "$ATOK" '{"status":"RESOLVED"}'

hdr "ADMIN: аудит + гайды"
chk "журнал аудита"            200 GET "$CORE/admin/audit" "$ATOK"
chk "создать гайд"             201 POST "$CORE/guides" "$ATOK" '{"titleRu":"Как оформить пособие","bodyRu":"Пошаговая инструкция"}'

# ═══════════════════════════════════════════════════════════════════════════
# MODERATOR — модерация новостей и комментариев
# ═══════════════════════════════════════════════════════════════════════════
hdr "MODERATOR"
MTOK0=$(make_user "cap_mod_${TS}@x.com" "Модер"); MOD_UID=$(uid_of "cap_mod_${TS}@x.com")
req PATCH "$CORE/admin/users/$MOD_UID/role" "$ATOK" '{"role":"MODERATOR"}' >/dev/null
# Перелогин НЕ нужен: роль читается из БД (кэш сброшен при смене роли) на том же токене.
MTOK="$MTOK0"; R=$(role_of "$MTOK")
[ "$R" = "MODERATOR" ] && ok "роль MODERATOR подхватилась без перелогина" || no "роль = $R"
# новость на модерацию
NM=$(req POST "$CORE/news" "$CLIENT" '{"titleRu":"Вторая новость","bodyRu":"Текст для модератора"}')
NMID=$(jqf "$NM" '.id')
chk "видит очередь новостей"    200 GET "$CORE/news/moderation/pending" "$MTOK"
[ -n "$NMID" ] && chk "публикует новость" 200 PATCH "$CORE/news/$NMID/moderate" "$MTOK" '{"status":"PUBLISHED"}'
# комментарий на модерацию (к опубликованной новости)
if [ -n "$NMID" ]; then
  CM=$(req POST "$CORE/news/$NMID/comments" "$CLIENT" '{"text":"Очень полезно, спасибо"}')
  CMID=$(jqf "$CM" '.id')
  chk "видит очередь комментариев" 200 GET "$CORE/news/moderation/comments" "$MTOK"
  [ -n "$CMID" ] && chk "одобряет комментарий" 200 PATCH "$CORE/news/comments/$CMID/moderate" "$MTOK" '{"status":"PUBLISHED"}'
fi
chk "видит список юзеров"       200 GET "$CORE/admin/users" "$MTOK"
chk "НЕ может менять роли"      403 PATCH "$CORE/admin/users/$MOD_UID/role" "$MTOK" '{"role":"USER"}'
[ -n "$NMID" ] && chk "НЕ может удалять новость" 403 DELETE "$CORE/admin/news/$NMID" "$MTOK"

# ═══════════════════════════════════════════════════════════════════════════
# ORG_MANAGER — своя организация и услуги
# ═══════════════════════════════════════════════════════════════════════════
hdr "ORG_MANAGER"
OTOK0=$(make_user "cap_org_${TS}@x.com" "Оргмен")
req POST "$CORE/organizations/register" "$OTOK0" '{"nameRu":"Моя Орг","city":"Алматы"}' >/dev/null
OTOK="$OTOK0"; R=$(role_of "$OTOK")
[ "$R" = "ORG_MANAGER" ] && ok "роль ORG_MANAGER подхватилась без перелогина" || no "роль = $R"
chk "видит свою орг"            200 GET   "$CORE/organizations/mine" "$OTOK"
chk "обновляет профиль орг"     200 PATCH "$CORE/organizations/mine" "$OTOK" '{"description":"Описание услуг","phone":"+77001234567"}'
SVC=$(req POST "$CORE/organizations/mine/services" "$OTOK" '{"nameRu":"Консультация","price":5000}')
SID=$(jqf "$SVC" '.id')
[ -n "$SID" ] && ok "добавил услугу id=$SID" || no "create service: $SVC"
chk "список услуг"              200 GET   "$CORE/organizations/mine/services" "$OTOK"
[ -n "$SID" ] && chk "обновляет услугу" 200 PATCH "$CORE/organizations/mine/services/$SID" "$OTOK" '{"price":7000}'
chk "аналитика орг"             200 GET   "$CORE/organizations/mine/analytics" "$OTOK"
chk "кто сохранил орг"          200 GET   "$CORE/organizations/mine/saved-users" "$OTOK"
[ -n "$SID" ] && chk "удаляет услугу" 200 DELETE "$CORE/organizations/mine/services/$SID" "$OTOK"

# ═══════════════════════════════════════════════════════════════════════════
# TAXI_MANAGER — назначение водителя + чат с клиентом (главный сценарий)
# ═══════════════════════════════════════════════════════════════════════════
hdr "TAXI_MANAGER: подготовка"
TTOK0=$(make_user "cap_taxi_${TS}@x.com" "Таксимен")
CODE=$(req POST "$TAXI/manager-auth/invite" "$ATOK" | jq -r '.code // empty')
req POST "$TAXI/manager-auth/register" "$TTOK0" "{\"inviteCode\":\"$CODE\",\"firstName\":\"Такси\",\"lastName\":\"Мен\",\"phone\":\"+7702${TS}\"}" >/dev/null
sleep 1
# taxi-svc читает роль из payload JWT (нет доступа к БД core) → нужен ПЕРЕЛОГИН,
# чтобы получить токен с обновлённой ролью TAXI_MANAGER в payload.
TTOK=$(login "cap_taxi_${TS}@x.com"); R=$(role_of "$TTOK")
[ "$R" = "TAXI_MANAGER" ] && ok "роль TAXI_MANAGER после перелогина" || no "роль = $R (проверь ADMIN_KEY/CORE_SVC_URL в taxi-svc)"

hdr "TAXI_MANAGER: панель"
chk "статистика"               200 GET "$TAXI/manager/stats" "$TTOK"
chk "очередь заявок"           200 GET "$TAXI/manager/queue" "$TTOK"
chk "свободные водители"       200 GET "$TAXI/manager/drivers/available" "$TTOK"
chk "все заявки"               200 GET "$TAXI/manager/bookings" "$TTOK"

hdr "TAXI_MANAGER: водители"
DRV=$(req POST "$TAXI/drivers" "$TTOK" "{\"firstName\":\"Иван\",\"lastName\":\"Петров\",\"phone\":\"+7705${TS}\",\"licensePlate\":\"M${TS}\",\"vehicleType\":\"WHEELCHAIR_VAN\"}")
DID=$(jqf "$DRV" '.id')
[ -n "$DID" ] && ok "менеджер добавил водителя id=$DID" || no "create driver: $DRV"
[ -n "$DID" ] && chk "менеджер меняет статус водителя" 200 PATCH "$TAXI/drivers/$DID/status?status=ACTIVE" "$TTOK"

hdr "TAXI_MANAGER: клиент заказывает → менеджер ведёт заявку"
BK=$(req POST "$TAXI/bookings" "$CLIENT" '{"fromAddress":"Дом","toAddress":"Больница","fromLat":43.238,"fromLon":76.889,"toLat":43.25,"toLon":76.96,"scheduledAt":"2026-06-15T09:00:00Z","disabilityType":"WHEELCHAIR"}')
BID=$(jqf "$BK" '.id')
[ -n "$BID" ] && ok "клиент создал заявку id=$BID (PENDING)" || no "create booking: $BK"
if [ -n "$BID" ] && [ -n "$DID" ]; then
  chk "менеджер видит детали заявки"  200 GET   "$TAXI/manager/bookings/$BID" "$TTOK"
  chk "менеджер НАЗНАЧАЕТ водителя → CONFIRMED" 200 PATCH "$TAXI/manager/bookings/$BID/assign" "$TTOK" "{\"driverId\":\"$DID\"}"
  chk "менеджер: статус IN_PROGRESS"  200 PATCH "$TAXI/manager/bookings/$BID/status" "$TTOK" '{"status":"IN_PROGRESS"}'
  chk "менеджер: статус COMPLETED"    200 PATCH "$TAXI/manager/bookings/$BID/status" "$TTOK" '{"status":"COMPLETED"}'
fi

hdr "TAXI_MANAGER: чат с клиентом (диалог в обе стороны)"
if [ -n "$BID" ]; then
  chk "клиент пишет менеджеру"        201 POST "$TAXI/chat/bookings/$BID/messages" "$CLIENT" '{"text":"Здравствуйте, когда приедет водитель?"}'
  chk "менеджер читает диалог"        200 GET  "$TAXI/chat/manager/bookings/$BID/messages" "$TTOK"
  chk "менеджер отвечает клиенту"     201 POST "$TAXI/chat/manager/bookings/$BID/messages" "$TTOK" '{"text":"Водитель будет через 10 минут"}'
  chk "клиент читает ответ"           200 GET  "$TAXI/chat/bookings/$BID/messages" "$CLIENT"
  chk "у клиента счётчик непрочит."   200 GET  "$TAXI/chat/unread" "$CLIENT"
  chk "у менеджера счётчик непрочит." 200 GET  "$TAXI/chat/manager/unread" "$TTOK"
  # после завершённой поездки клиент оставляет отзыв
  chk "клиент оставляет отзыв"        201 POST "$TAXI/drivers/bookings/$BID/review" "$CLIENT" '{"rating":5,"comment":"Отличный водитель"}'
fi

echo
echo "════════════════════════════"
echo "  ✅ прошло: $P    ❌ упало: $F"
echo "════════════════════════════"
