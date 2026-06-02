#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# ПОЛНОЕ ДОПОКРЫТИЕ core/taxi — модули, которых не было в остальных скриптах:
#   AUTH (refresh/logout/verify/resend/forgot/reset/2FA),
#   PROFILE (me/avatar/location/accessibility/likes/device-token/links),
#   NOTIFICATIONS, REVIEWS (орг+специалист), GUIDES (CRUD), COMPLAINTS,
#   TICKETS, ORGANIZATIONS (публичный browse + admin CRUD),
#   TAXI (estimate-price, driver-location, drivers/:id, manager-auth invites/me).
#
#   bash docs/test_full.sh
# Требуется docker (verify email / роль), jq, curl. bash 3.2 (macOS).
# Логинов ~7 — под лимитом 10/мин. Запускать отдельно от других скриптов.
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

req(){ local m="$1" url="$2" tok="${3:-}" b="${4:-}"
  local args=(-s -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"; }
chk(){ local label="$1" exp="$2" m="$3" url="$4" tok="${5:-}" body="${6:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$url")
  [ -n "$tok" ]  && args+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local code; code=$(curl "${args[@]}")
  if [ "$code" = "$exp" ]; then ok "$label ($code)"; else no "$label ($code, ждали $exp)"; fi; }
chk2(){ # принимает 2 допустимых кода
  local label="$1" e1="$2" e2="$3" m="$4" url="$5" tok="${6:-}" body="${7:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$url")
  [ -n "$tok" ]  && args+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local code; code=$(curl "${args[@]}")
  if [ "$code" = "$e1" ] || [ "$code" = "$e2" ]; then ok "$label ($code)"; else no "$label ($code, ждали $e1/$e2)"; fi; }
jqf(){ echo "$1" | jq -r "$2 // empty"; }
command -v jq >/dev/null     || { echo "нужен jq";     exit 1; }
command -v docker >/dev/null || { echo "нужен docker"; exit 1; }

verify_email(){ docker exec core_db psql -U core_user -d core_db -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$1';" >/dev/null 2>&1; }
uid_of(){ docker exec core_db psql -U core_user -d core_db -tAc "SELECT id FROM \"User\" WHERE email='$1';" 2>/dev/null | tr -d '[:space:]'; }
login(){ req POST "$CORE/auth/login" "" "{\"email\":\"$1\",\"password\":\"$PASS\"}"; }
make_user(){ local email="$1" first="$2"
  req POST "$CORE/auth/register" "" "{\"email\":\"$email\",\"password\":\"$PASS\",\"firstName\":\"$first\",\"lastName\":\"Т\",\"role\":\"USER\"}" >/dev/null
  verify_email "$email"
  login "$email" | jq -r '.accessToken // empty'; }

# ─── участники ───
ATOK=$(req POST "$CORE/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.accessToken // empty')
req POST "$CORE/auth/register" "" "{\"email\":\"full_u_${TS}@x.com\",\"password\":\"$PASS\",\"firstName\":\"Юзер\",\"lastName\":\"Т\",\"role\":\"USER\"}" >/dev/null
verify_email "full_u_${TS}@x.com"
LOGIN_U=$(login "full_u_${TS}@x.com")
UTOK=$(echo "$LOGIN_U" | jq -r '.accessToken // empty')
RTOK=$(echo "$LOGIN_U" | jq -r '.refreshToken // empty')   # refresh для /auth/refresh
U_UID=$(uid_of "full_u_${TS}@x.com")
U2TOK=$(make_user "full_u2_${TS}@x.com" "Цель")
U2_UID=$(uid_of "full_u2_${TS}@x.com")
[ -n "$ATOK" ] && [ -n "$UTOK" ] && [ -n "$U2TOK" ] || { echo "нет базовых токенов — стоп"; exit 1; }
ok "токены ADMIN / USER / USER2 + refresh получены"

# ═══════════════════════════════════════════════════════════════════════════
# AUTH (всё, что не login/register/me)
# ═══════════════════════════════════════════════════════════════════════════
hdr "AUTH: refresh / verify / resend / forgot / reset / 2FA / logout"
NEWA=$(req POST "$CORE/auth/refresh" "" "{\"refreshToken\":\"$RTOK\"}" | jq -r '.accessToken // empty')
[ -n "$NEWA" ] && ok "refresh → новый accessToken" || no "refresh не вернул токен"
chk "refresh с мусором → 401"          401 POST "$CORE/auth/refresh" "" '{"refreshToken":"garbage"}'
chk "verify битый token → 400"         400 GET  "$CORE/auth/verify?token=garbage-$TS"
chk "resend-verification → 200"        200 POST "$CORE/auth/resend-verification" "" "{\"email\":\"full_u_${TS}@x.com\"}"
chk "forgot-password → 200"            200 POST "$CORE/auth/forgot-password" "" "{\"email\":\"full_u_${TS}@x.com\"}"
chk "reset-password битый код → 400"   400 POST "$CORE/auth/reset-password" "" '{"token":"bad","newPassword":"Test1234"}'
SET2FA=$(req POST "$CORE/auth/2fa/setup" "$U2TOK")
echo "$SET2FA" | jq -e '.secret // .otpauthUrl // .qr' >/dev/null 2>&1 && ok "2fa/setup → secret выдан" || no "2fa/setup без secret ($SET2FA)"
chk2 "2fa/verify неверный код → 4xx"   400 401 POST "$CORE/auth/2fa/verify" "$U2TOK" '{"token":"000000"}'
chk "logout → 200"                     200 POST "$CORE/auth/logout" "$U2TOK"
# U2 перелогинимся (logout инвалидировал refresh, access ещё жив, но возьмём свежий)
U2TOK=$(login "full_u2_${TS}@x.com" | jq -r '.accessToken // empty')

# ═══════════════════════════════════════════════════════════════════════════
# PROFILE
# ═══════════════════════════════════════════════════════════════════════════
hdr "PROFILE"
chk "GET /profile/me → 200"               200 GET   "$CORE/profile/me" "$UTOK"

# ─── РЕГРЕССИЯ: приватные секреты не должны утекать в ответах ───
ME=$(req GET "$CORE/auth/me" "$UTOK")
if echo "$ME" | jq -e 'has("totpSecret") or has("passwordHash")' >/dev/null 2>&1; then
  no "/auth/me СОДЕРЖИТ totpSecret/passwordHash (утечка!)"
else ok "/auth/me без totpSecret/passwordHash"; fi
PME=$(req GET "$CORE/profile/me" "$UTOK")
if echo "$PME" | jq -e 'has("totpSecret") or has("passwordHash")' >/dev/null 2>&1; then
  no "/profile/me СОДЕРЖИТ totpSecret/passwordHash (утечка!)"
else ok "/profile/me без totpSecret/passwordHash"; fi
chk "PATCH /profile/me → 200"             200 PATCH "$CORE/profile/me" "$UTOK" '{"city":"Алматы","phone":"+77010000000"}'
chk "PATCH /profile/me/location → 200"    200 PATCH "$CORE/profile/me/location" "$UTOK" '{"lat":43.238,"lon":76.889}'
chk "GET /profile/me/accessibility → 200" 200 GET   "$CORE/profile/me/accessibility" "$UTOK"
chk "PATCH accessibility → 200"           200 PATCH "$CORE/profile/me/accessibility" "$UTOK" '{"fontSize":"large","highContrast":true}'
chk "GET /profile/me/liked-news → 200"    200 GET   "$CORE/profile/me/liked-news" "$UTOK"
chk "GET /profile/me/liked-guides → 200"  200 GET   "$CORE/profile/me/liked-guides" "$UTOK"
chk2 "POST device-token → 200/201"        200 201 POST   "$CORE/profile/me/device-token" "$UTOK" '{"token":"fcm_'"$TS"'","platform":"android"}'
chk "DELETE device-token → 200"           200 DELETE "$CORE/profile/me/device-token" "$UTOK" '{"token":"fcm_'"$TS"'","platform":"android"}'
chk "GET /profile/:id (публичный) → 200"  200 GET   "$CORE/profile/$U2_UID" ""
# аватар: неверный mime → 400 (после фикса fileFilter BadRequestException)
TXT=$(mktemp); echo x > "$TXT"
AV=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$CORE/profile/me/avatar" -H "Authorization: Bearer $UTOK" -F "file=@${TXT};filename=e.txt;type=text/plain"); rm -f "$TXT"
[ "$AV" = "400" ] && ok "avatar неверный mime → 400" || no "avatar mime ($AV, ждали 400 — нужен ребилд core)"
# links: создавать связку может только RELATIVE → USER получает 403 (корректный гвард)
chk "USER → links/request → 403 (только RELATIVE)" 403 POST "$CORE/profile/links/request" "$U2TOK" "{\"dependentEmail\":\"full_u_${TS}@x.com\",\"label\":\"опекун\"}"
chk "GET links/my → 200"                  200 GET  "$CORE/profile/links/my" "$U2TOK"

# ═══════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════
hdr "NOTIFICATIONS"
chk "GET /notifications/my → 200"      200 GET   "$CORE/notifications/my" "$UTOK"
chk "PATCH my/read-all → 200"          200 PATCH "$CORE/notifications/my/read-all" "$UTOK"
chk "GET my без токена → 401"          401 GET   "$CORE/notifications/my"

# ═══════════════════════════════════════════════════════════════════════════
# REVIEWS (нужна организация → создаём через admin)
# ═══════════════════════════════════════════════════════════════════════════
hdr "REVIEWS"
ORG=$(req POST "$CORE/admin/organizations" "$ATOK" '{"nameRu":"Орг для отзывов","category":"MEDICAL","city":"Алматы"}')
OID=$(jqf "$ORG" '.id')
[ -n "$OID" ] && ok "admin создал орг id=$OID" || no "орг не создана ($ORG)"
chk2 "POST org review → 200/201"   200 201 POST "$CORE/organizations/$OID/reviews" "$UTOK" '{"rating":5,"comment":"Отлично"}'
chk "GET org reviews (публ) → 200" 200 GET  "$CORE/organizations/$OID/reviews"
chk2 "POST specialist review → 200/201" 200 201 POST "$CORE/specialists/$U2_UID/reviews" "$UTOK" '{"rating":4,"comment":"Хорошо"}'
chk "GET specialist reviews → 200" 200 GET  "$CORE/specialists/$U2_UID/reviews"

# ═══════════════════════════════════════════════════════════════════════════
# GUIDES (CRUD — создаёт ADMIN)
# ═══════════════════════════════════════════════════════════════════════════
hdr "GUIDES"
G=$(req POST "$CORE/guides" "$ATOK" '{"titleRu":"Гайд тест","bodyRu":"Текст инструкции"}')
GID=$(jqf "$G" '.id')
[ -n "$GID" ] && ok "ADMIN создал гайд id=$GID" || no "гайд не создан ($G)"
chk "USER создаёт гайд → 403"      403 POST  "$CORE/guides" "$UTOK" '{"titleRu":"x","bodyRu":"y"}'
chk "PATCH publish → 200"          200 PATCH "$CORE/guides/$GID/publish" "$ATOK"
chk "GET /guides/:id → 200"        200 GET   "$CORE/guides/$GID"
chk2 "POST like → 200/201"         200 201 POST  "$CORE/guides/$GID/like" "$UTOK"
chk "PATCH unpublish → 200"        200 PATCH "$CORE/guides/$GID/unpublish" "$ATOK"

# ═══════════════════════════════════════════════════════════════════════════
# COMPLAINTS
# ═══════════════════════════════════════════════════════════════════════════
hdr "COMPLAINTS"
CMP=$(req POST "$CORE/complaints" "$UTOK" "{\"targetType\":\"organization\",\"targetId\":\"$OID\",\"reason\":\"Неверный адрес\"}")
CMPID=$(jqf "$CMP" '.id')
[ -n "$CMPID" ] && ok "USER подал жалобу id=$CMPID" || no "жалоба не создана ($CMP)"
chk "GET complaints/my → 200"        200 GET   "$CORE/complaints/my" "$UTOK"
chk "GET complaints/:id (своя) → 200" 200 GET  "$CORE/complaints/$CMPID" "$UTOK"
chk2 "U2 читает чужую жалобу → 403/404" 403 404 GET "$CORE/complaints/$CMPID" "$U2TOK"
chk "USER → complaints/all → 403"    403 GET   "$CORE/complaints/all" "$UTOK"
chk "ADMIN → complaints/all → 200"   200 GET   "$CORE/complaints/all" "$ATOK"
chk "ADMIN PATCH статус → 200"       200 PATCH "$CORE/complaints/$CMPID/status" "$ATOK" '{"status":"UNDER_REVIEW"}'

# ═══════════════════════════════════════════════════════════════════════════
# TICKETS
# ═══════════════════════════════════════════════════════════════════════════
hdr "TICKETS"
TK=$(req POST "$CORE/tickets" "$UTOK" '{"subject":"Помощь","body":"Нужна помощь с документами"}')
TKID=$(jqf "$TK" '.id')
[ -n "$TKID" ] && ok "USER создал тикет id=$TKID" || no "тикет не создан ($TK)"
chk "GET tickets/my → 200"          200 GET   "$CORE/tickets/my" "$UTOK"
chk "GET tickets/:id (свой) → 200"  200 GET   "$CORE/tickets/$TKID" "$UTOK"
chk "USER → tickets/all → 403"      403 GET   "$CORE/tickets/all" "$UTOK"
chk "ADMIN → tickets/all → 200"     200 GET   "$CORE/tickets/all" "$ATOK"
chk "ADMIN PATCH статус → 200"      200 PATCH "$CORE/tickets/$TKID/status" "$ATOK" '{"status":"IN_PROGRESS"}'

# ═══════════════════════════════════════════════════════════════════════════
# ORGANIZATIONS — публичный browse
# ═══════════════════════════════════════════════════════════════════════════
hdr "ORGANIZATIONS (public browse)"
chk "GET /organizations (list) → 200"          200 GET "$CORE/organizations"
chk "GET /organizations/nearby → 200"          200 GET "$CORE/organizations/nearby?lat=43.238&lon=76.889&radius=50"
chk "GET /organizations/search → 200"          200 GET "$CORE/organizations/search?query=org"
chk "GET /organizations/:id → 200"             200 GET "$CORE/organizations/$OID"
chk "GET /organizations/:id несущ. → 404"      404 GET "$CORE/organizations/00000000-0000-0000-0000-000000000000"
chk2 "POST /organizations/:id/save → 200/201"  200 201 POST   "$CORE/organizations/$OID/save" "$UTOK"
chk "DELETE /organizations/:id/save → 200"     200 DELETE "$CORE/organizations/$OID/save" "$UTOK"

# ═══════════════════════════════════════════════════════════════════════════
# ADMIN / ORGANIZATIONS — CRUD
# ═══════════════════════════════════════════════════════════════════════════
hdr "ADMIN / ORGANIZATIONS (CRUD)"
chk "GET admin/organizations → 200"     200 GET   "$CORE/admin/organizations" "$ATOK"
chk "GET admin/organizations/:id → 200" 200 GET   "$CORE/admin/organizations/$OID" "$ATOK"
chk "PATCH admin/organizations/:id → 200" 200 PATCH "$CORE/admin/organizations/$OID" "$ATOK" '{"description":"Обновлено"}'
chk "PATCH :id/verify → 200"            200 PATCH "$CORE/admin/organizations/$OID/verify" "$ATOK" '{"method":"call","statusTo":"VERIFIED"}'
chk "GET :id/logs → 200"                200 GET   "$CORE/admin/organizations/$OID/logs" "$ATOK"
chk "USER → admin/organizations → 403"  403 GET   "$CORE/admin/organizations" "$UTOK"
chk "DELETE admin/organizations/:id (ADMIN) → 200" 200 DELETE "$CORE/admin/organizations/$OID" "$ATOK"

# ═══════════════════════════════════════════════════════════════════════════
# TAXI — оставшиеся
# ═══════════════════════════════════════════════════════════════════════════
hdr "TAXI: estimate-price / driver-location / drivers/:id / manager-auth"
EST=$(req GET "$TAXI/bookings/estimate-price?fromLat=43.238&fromLon=76.889&toLat=43.25&toLon=76.96&disabilityType=WHEELCHAIR" "$UTOK")
echo "$EST" | jq -e '.price // .estimatedPrice // .total' >/dev/null 2>&1 && ok "estimate-price → цена рассчитана" || no "estimate-price без цены ($EST)"
# driver-location: создаём заявку без водителя → available:false
BK=$(req POST "$TAXI/bookings" "$UTOK" '{"fromAddress":"Дом","toAddress":"Клиника","fromLat":43.238,"fromLon":76.889,"toLat":43.25,"toLon":76.96,"scheduledAt":"2026-07-01T09:00:00Z","disabilityType":"WHEELCHAIR"}')
BKID=$(jqf "$BK" '.id')
DL=$(req GET "$TAXI/bookings/$BKID/driver-location" "$UTOK")
DL_AV=$(echo "$DL" | jq -r '.available')   # jq: false != пусто, поэтому без // empty
[ "$DL_AV" = "false" ] && ok "driver-location (нет водителя) → available:false" || no "driver-location = $DL"
chk "driver-location без токена → 401" 401 GET "$TAXI/bookings/$BKID/driver-location"
# drivers/:id — создаём водителя (admin) и читаем публичный профиль
DRV=$(req POST "$TAXI/drivers" "$ATOK" "{\"firstName\":\"Пётр\",\"lastName\":\"Ф\",\"phone\":\"+7707${TS}\",\"licensePlate\":\"FULL ${TS}\"}")
DID=$(jqf "$DRV" '.id')
chk "GET /drivers/:id (публ) → 200"    200 GET "$TAXI/drivers/$DID"
chk "GET /drivers/:id несущ. → 404"    404 GET "$TAXI/drivers/00000000-0000-0000-0000-000000000000"
# manager-auth
chk "GET manager-auth/invites (ADMIN) → 200" 200 GET "$TAXI/manager-auth/invites" "$ATOK"
chk "USER → manager-auth/invites → 403"  403 GET "$TAXI/manager-auth/invites" "$UTOK"
chk "manager-auth/me (не менеджер) → 404" 404 GET "$TAXI/manager-auth/me" "$UTOK"

echo
echo "════════════════════════════"
echo "  ✅ прошло: $P    ❌ упало: $F"
echo "════════════════════════════"
