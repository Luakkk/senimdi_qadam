#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# Проверка ЛОГИНА по всем ролям end-to-end (без подмены админом).
# Логин у всех один — core-svc /api/auth/login. Роль зашивается в JWT
# в момент логина → после смены роли нужно ПЕРЕЛОГИНИТЬСЯ.
#
# Проверяем по каждой роли:
#   1) /auth/me показывает нужную роль (из БД),
#   2) ролевой маршрут отдаёт 200 (роль реально в токене → проходит RolesGuard),
#   3) обычный USER на тот же маршрут получает 403.
#
#   bash docs/test_roles.sh
# Требуется docker (для подтверждения email и смены роли напрямую в core_db).
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

# универсальный chk: BASEURL передаётся первым
chk(){ # LABEL EXPECTED METHOD FULLURL [TOKEN] [BODY]
  local label="$1" exp="$2" m="$3" url="$4" tok="${5:-}" body="${6:-}"
  local args=(-s -o /dev/null -w "%{http_code}" -X "$m" "$url")
  [ -n "$tok" ]  && args+=(-H "Authorization: Bearer $tok")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local code; code=$(curl "${args[@]}")
  if [ "$code" = "$exp" ]; then ok "$label ($code)"; else no "$label ($code, ждали $exp)"; fi
}
post(){ # FULLURL TOKEN BODY  -> тело
  local url="$1" tok="${2:-}" b="${3:-}"
  local args=(-s -X POST "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"
}
get(){ curl -s -H "Authorization: Bearer $2" "$1"; }
command -v jq >/dev/null     || { echo "нужен jq";     exit 1; }
command -v docker >/dev/null || { echo "нужен docker"; exit 1; }

# регистрируем юзера, подтверждаем email, логинимся → печатаем токен в stdout
make_user(){ # EMAIL FIRST -> token (через stdout); userId в глобал NEW_UID
  local email="$1" first="$2"
  local reg; reg=$(post "$CORE/auth/register" "" "{\"email\":\"$email\",\"password\":\"$PASS\",\"firstName\":\"$first\",\"lastName\":\"Т\",\"role\":\"USER\"}")
  NEW_UID=$(echo "$reg" | jq -r '.user.id // .id // empty')
  docker exec core_db psql -U core_user -d core_db -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$email';" >/dev/null 2>&1
  # userId возьмём из БД, если не было в ответе
  [ -z "$NEW_UID" ] && NEW_UID=$(docker exec core_db psql -U core_user -d core_db -tAc "SELECT id FROM \"User\" WHERE email='$email';" 2>/dev/null | tr -d '[:space:]')
  local log; log=$(post "$CORE/auth/login" "" "{\"email\":\"$email\",\"password\":\"$PASS\"}")
  echo "$log" | jq -r '.accessToken // empty'
}
login(){ # EMAIL PASSWORD -> token
  post "$CORE/auth/login" "" "{\"email\":\"$1\",\"password\":\"$2\"}" | jq -r '.accessToken // empty'
}
role_of(){ get "$CORE/auth/me" "$1" | jq -r '.role // "?"'; } # роль из /auth/me
uid_of(){ docker exec core_db psql -U core_user -d core_db -tAc "SELECT id FROM \"User\" WHERE email='$1';" 2>/dev/null | tr -d '[:space:]'; }

# обычный USER для негативных проверок 403
UTOK=$(make_user "role_user_${TS}@x.com" "Юзер")
[ -n "$UTOK" ] && ok "baseline USER логин ок (роль $(role_of "$UTOK"))" || { echo "нет USER токена — стоп"; exit 1; }

# ═══════════════════════ ADMIN (всего сайта) ═══════════════════════
hdr "ADMIN"
ATOK=$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
if [ -n "$ATOK" ]; then
  R=$(role_of "$ATOK")
  [ "$R" = "ADMIN" ] && ok "admin login → роль ADMIN" || no "admin роль = $R (ждали ADMIN)"
  chk "core /admin/users -> 200"        200 GET "$CORE/admin/users" "$ATOK"
  chk "core /admin/audit -> 200"        200 GET "$CORE/admin/audit" "$ATOK"
  chk "taxi /manager/stats -> 200"      200 GET "$TAXI/manager/stats" "$ATOK"
  chk "USER → /admin/users -> 403"      403 GET "$CORE/admin/users" "$UTOK"
else
  no "admin login не удался"
fi

# ═══════════════════════ MODERATOR ═══════════════════════
hdr "MODERATOR"
MTOK0=$(make_user "role_mod_${TS}@x.com" "Модер"); MOD_UID=$(uid_of "role_mod_${TS}@x.com")
chk "до повышения: /news/moderation/pending -> 403" 403 GET "$CORE/news/moderation/pending" "$MTOK0"
# админ назначает роль MODERATOR (эндпоинт — PATCH, не POST!)
curl -s -X PATCH "$CORE/admin/users/$MOD_UID/role" \
  -H "Authorization: Bearer $ATOK" -H 'Content-Type: application/json' \
  -d '{"role":"MODERATOR"}' >/dev/null
MTOK=$(login "role_mod_${TS}@x.com" "$PASS")   # ПЕРЕЛОГИН → новая роль в токене
R=$(role_of "$MTOK")
[ "$R" = "MODERATOR" ] && ok "после перелогина → роль MODERATOR" || no "роль = $R (ждали MODERATOR)"
chk "MODERATOR → /news/moderation/pending -> 200" 200 GET "$CORE/news/moderation/pending" "$MTOK"
chk "MODERATOR → /admin/users -> 200"             200 GET "$CORE/admin/users" "$MTOK"
chk "MODERATOR → смена роли (ADMIN only) -> 403"  403 PATCH "$CORE/admin/users/$MOD_UID/role" "$MTOK" '{"role":"USER"}'

# ═══════════════════════ ORG_MANAGER ═══════════════════════
hdr "ORG_MANAGER"
OTOK0=$(make_user "role_org_${TS}@x.com" "Оргмен")
chk "до регистрации орг: /organizations/mine -> 403" 403 GET "$CORE/organizations/mine" "$OTOK0"
# регистрация организации повышает роль до ORG_MANAGER
post "$CORE/organizations/register" "$OTOK0" '{"nameRu":"Орг Тест","city":"Алматы"}' >/dev/null
OTOK=$(login "role_org_${TS}@x.com" "$PASS")   # ПЕРЕЛОГИН
R=$(role_of "$OTOK")
[ "$R" = "ORG_MANAGER" ] && ok "после перелогина → роль ORG_MANAGER" || no "роль = $R (ждали ORG_MANAGER)"
chk "ORG_MANAGER → /organizations/mine -> 200"  200 GET "$CORE/organizations/mine" "$OTOK"
chk "ORG_MANAGER → /organizations/mine/analytics -> 200" 200 GET "$CORE/organizations/mine/analytics" "$OTOK"
chk "USER → /organizations/mine -> 403"         403 GET "$CORE/organizations/mine" "$UTOK"

# ═══════════════════════ TAXI_MANAGER ═══════════════════════
hdr "TAXI_MANAGER"
TTOK0=$(make_user "role_taxi_${TS}@x.com" "Таксимен")
chk "до регистрации: taxi /manager/stats -> 403" 403 GET "$TAXI/manager/stats" "$TTOK0"
# админ генерирует инвайт в taxi-svc
CODE=$(post "$TAXI/manager-auth/invite" "$ATOK" | jq -r '.code // empty')
[ -n "$CODE" ] && ok "admin сгенерил инвайт: $CODE" || no "инвайт не получен"
# регистрация менеджера по инвайту → taxi-svc промотит роль в core через internal
post "$TAXI/manager-auth/register" "$TTOK0" "{\"inviteCode\":\"$CODE\",\"firstName\":\"Такси\",\"lastName\":\"Мен\",\"phone\":\"+7702${TS}\"}" >/dev/null
sleep 1   # даём internal-промоушену примениться
TTOK=$(login "role_taxi_${TS}@x.com" "$PASS")   # ПЕРЕЛОГИН
R=$(role_of "$TTOK")
[ "$R" = "TAXI_MANAGER" ] && ok "после перелогина → роль TAXI_MANAGER" || no "роль = $R (ждали TAXI_MANAGER — проверь ADMIN_KEY/CORE_SVC_URL в taxi-svc)"
chk "TAXI_MANAGER → taxi /manager/stats -> 200"  200 GET "$TAXI/manager/stats" "$TTOK"
chk "TAXI_MANAGER → taxi /manager/queue -> 200"  200 GET "$TAXI/manager/queue" "$TTOK"
chk "TAXI_MANAGER → core /admin/users -> 403"    403 GET "$CORE/admin/users" "$TTOK"
chk "USER → taxi /manager/stats -> 403"          403 GET "$TAXI/manager/stats" "$UTOK"

echo
echo "════════════════════════════"
echo "  ✅ прошло: $P    ❌ упало: $F"
echo "════════════════════════════"
