#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# SECURITY / NEGATIVE проверки core-svc + taxi-svc.
# Проверяем НЕ "работает ли", а "правильно ли ЗАПРЕЩАЕТ":
#   1) чужие данные (IDOR): юзер B не может трогать ресурсы юзера A,
#   2) битые/отсутствующие JWT → 401,
#   3) internal-промоушен принимает только верный x-internal-key,
#   4) лимиты загрузки файлов (mime/размер/отсутствие файла),
#   5) валидация мусорного ввода → 400 (а не 500).
#
#   bash docs/test_security.sh
# Требуется docker (подтверждение email, получение userId из core_db) и jq.
# bash 3.2-совместимо (macOS).
# ──────────────────────────────────────────────────────────────────────────
set -u
CORE=http://localhost:3001/api
TAXI=http://localhost:3002
TS=$(date +%s)
PASS="Test1234"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@senimdi.kz}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin2026!}"
BADKEY="definitely-not-the-admin-key-$TS"
GARBAGE="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoYWNrIn0.invalidsignature"

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
# Проверка "отклонено любым 4xx" — для multipart, где multer может вернуть 400/413.
chk4xx(){ # LABEL METHOD FULLURL TOKEN -F-ARGS...
  local label="$1" m="$2" url="$3" tok="$4"; shift 4
  local code; code=$(curl -s -o /dev/null -w "%{http_code}" -X "$m" "$url" \
    -H "Authorization: Bearer $tok" "$@")
  case "$code" in
    4*) ok "$label ($code)";;
    *)  no "$label ($code, ждали 4xx)";;
  esac
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
uid_of(){ docker exec core_db psql -U core_user -d core_db -tAc "SELECT id FROM \"User\" WHERE email='$1';" 2>/dev/null | tr -d '[:space:]'; }
make_user(){ # EMAIL FIRST -> token
  local email="$1" first="$2"
  req POST "$CORE/auth/register" "" "{\"email\":\"$email\",\"password\":\"$PASS\",\"firstName\":\"$first\",\"lastName\":\"Т\",\"role\":\"USER\"}" >/dev/null
  verify_email "$email"
  req POST "$CORE/auth/login" "" "{\"email\":\"$email\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty'
}
login(){ req POST "$CORE/auth/login" "" "{\"email\":\"$1\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty'; }

# ─── участники ───
ATOK=$(req POST "$CORE/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.accessToken // empty')
ATOK_A=$(make_user "sec_a_${TS}@x.com" "Алиса")   # владелец ресурсов
BTOK=$(make_user  "sec_b_${TS}@x.com" "Боб")      # «злоумышленник»
B_UID=$(uid_of "sec_b_${TS}@x.com")
[ -n "$ATOK" ] && [ -n "$ATOK_A" ] && [ -n "$BTOK" ] || { echo "нет базовых токенов — стоп (возможно лимит логина, подожди минуту)"; exit 1; }
ok "токены ADMIN / A(владелец) / B(чужой) получены"

# ═══════════════════════════════════════════════════════════════════════════
# 1) БИТЫЕ / ОТСУТСТВУЮЩИЕ ТОКЕНЫ → 401
# ═══════════════════════════════════════════════════════════════════════════
hdr "Битые/отсутствующие токены"
chk "core: /news/my/list без токена -> 401"        401 GET "$CORE/news/my/list"
chk "core: /news/my/list мусорный токен -> 401"    401 GET "$CORE/news/my/list" "$GARBAGE"
chk "core: /organizations/mine мусорный -> 401"    401 GET "$CORE/organizations/mine" "$GARBAGE"
chk "core: /auth/me без токена -> 401"             401 GET "$CORE/auth/me"
chk "taxi: /bookings/my без токена -> 401"         401 GET "$TAXI/bookings/my"
chk "taxi: /bookings/my мусорный токен -> 401"     401 GET "$TAXI/bookings/my" "$GARBAGE"

# ═══════════════════════════════════════════════════════════════════════════
# 2) ЧУЖИЕ ДАННЫЕ (IDOR) — A создаёт, B пытается трогать
# ═══════════════════════════════════════════════════════════════════════════
hdr "Подготовка ресурсов юзера A"
# Новость A → публикуем (для комментария нужна PUBLISHED)
NA=$(req POST "$CORE/news" "$ATOK_A" '{"titleRu":"Новость Алисы","bodyRu":"Текст"}')
NAID=$(jqf "$NA" '.id')
req PATCH "$CORE/news/$NAID/moderate" "$ATOK" '{"status":"PUBLISHED"}' >/dev/null
[ -n "$NAID" ] && ok "A создала новость id=$NAID (PUBLISHED)" || no "не создана новость A"
# Комментарий A к своей новости
CA=$(req POST "$CORE/news/$NAID/comments" "$ATOK_A" '{"text":"Мой комментарий"}')
CAID=$(jqf "$CA" '.id')
[ -n "$CAID" ] && ok "A создала комментарий id=$CAID" || no "не создан комментарий A"
# Заявка такси A + сообщение в чат
BKA=$(req POST "$TAXI/bookings" "$ATOK_A" '{"fromAddress":"Дом","toAddress":"Клиника","fromLat":43.238,"fromLon":76.889,"toLat":43.25,"toLon":76.96,"scheduledAt":"2026-07-01T09:00:00Z","disabilityType":"WHEELCHAIR"}')
BKAID=$(jqf "$BKA" '.id')
[ -n "$BKAID" ] && ok "A создала заявку такси id=$BKAID" || no "не создана заявка A"
req POST "$TAXI/chat/bookings/$BKAID/messages" "$ATOK_A" '{"text":"Здравствуйте"}' >/dev/null

hdr "B пытается трогать ресурсы A (должно быть запрещено)"
[ -n "$NAID" ]  && chk "B удаляет новость A -> 403"            403 DELETE "$CORE/news/$NAID" "$BTOK"
[ -n "$NAID" ] && [ -n "$CAID" ] && chk "B удаляет коммент A -> 403" 403 DELETE "$CORE/news/$NAID/comments/$CAID" "$BTOK"
[ -n "$BKAID" ] && chk "B смотрит заявку A -> 404"             404 GET    "$TAXI/bookings/$BKAID" "$BTOK"
[ -n "$BKAID" ] && chk "B читает чат заявки A -> 403"          403 GET    "$TAXI/chat/bookings/$BKAID/messages" "$BTOK"
[ -n "$BKAID" ] && chk "B пишет в чат заявки A -> 404"         404 POST   "$TAXI/chat/bookings/$BKAID/messages" "$BTOK" '{"text":"взлом"}'
# Контроль: сам владелец A — доступ есть
[ -n "$BKAID" ] && chk "контроль: A видит свою заявку -> 200"  200 GET    "$TAXI/bookings/$BKAID" "$ATOK_A"

# ═══════════════════════════════════════════════════════════════════════════
# 3) INTERNAL endpoint — только верный x-internal-key
# ═══════════════════════════════════════════════════════════════════════════
hdr "Internal promote — защита ключом"
# без ключа
code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$CORE/internal/users/$B_UID/promote-taxi-manager")
[ "$code" = "401" ] && ok "internal без ключа -> 401" || no "internal без ключа ($code, ждали 401)"
# неверный ключ
code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$CORE/internal/users/$B_UID/promote-taxi-manager" -H "x-internal-key: $BADKEY")
[ "$code" = "401" ] && ok "internal неверный ключ -> 401" || no "internal неверный ключ ($code, ждали 401)"
# контроль: B остался USER (промоушен не прошёл)
RB=$(req GET "$CORE/auth/me" "$BTOK" | jq -r '.role // "?"')
[ "$RB" = "USER" ] && ok "контроль: B всё ещё USER (взлома роли нет)" || no "B стал $RB — УТЕЧКА ПРИВИЛЕГИЙ!"

# ═══════════════════════════════════════════════════════════════════════════
# 4) ЛИМИТЫ ЗАГРУЗКИ ФАЙЛОВ (core news image, multipart)
# ═══════════════════════════════════════════════════════════════════════════
hdr "Загрузка фото к новости — фильтры"
if [ -n "$NAID" ]; then
  chk "загрузка без файла -> 400" 400 POST "$CORE/news/$NAID/image" "$ATOK_A"
  # неверный mime: шлём текстовый файл под видом картинки
  TXT=$(mktemp); echo "не картинка" > "$TXT"
  chk4xx "неверный mime (txt) отклонён" POST "$CORE/news/$NAID/image" "$ATOK_A" -F "file=@${TXT};filename=evil.txt;type=text/plain"
  # превышение размера: 6 МБ файл с расширением .png
  BIG=$(mktemp); head -c 6291456 /dev/zero > "$BIG"
  chk4xx "файл >5MB отклонён" POST "$CORE/news/$NAID/image" "$ATOK_A" -F "file=@${BIG};filename=big.png;type=image/png"
  rm -f "$TXT" "$BIG"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 5) ВАЛИДАЦИЯ МУСОРНОГО ВВОДА → 400 (а не 500)
# ═══════════════════════════════════════════════════════════════════════════
hdr "Валидация ввода"
chk "register битый email -> 400"           400 POST "$CORE/auth/register" "" '{"email":"не-email","password":"123","firstName":"X","lastName":"Y","role":"USER"}'
chk "register пустой body -> 400"           400 POST "$CORE/auth/register" "" '{}'
chk "news пустой body -> 400"               400 POST "$CORE/news" "$ATOK_A" '{}'
chk "taxi booking мусор -> 400"             400 POST "$TAXI/bookings" "$ATOK_A" '{"fromAddress":123}'
chk "admin смена роли невалидная -> 400"    400 PATCH "$CORE/admin/users/$B_UID/role" "$ATOK" '{"role":"SUPERGOD"}'

echo
echo "════════════════════════════"
echo "  ✅ прошло: $P    ❌ упало: $F"
echo "════════════════════════════"
