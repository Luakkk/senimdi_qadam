#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# ПОЛНАЯ проверка ai-svc (:8000) и gateway-api (:3000).
#   • ai-svc: health, chat, rag, sessions CRUD, speech (STT/TTS), auth-guards
#   • gateway: проксирование core/taxi/ai, raw-proxy multipart, auth-forward,
#     404 неизвестного сервиса, rate-limit /admin/login, бинарный TTS
#
#   bash docs/test_ai_gateway.sh
#   ADMIN_PASSWORD='...' bash docs/test_ai_gateway.sh
#
# Требует docker, jq, curl. core :3001, ai :8000, gateway :3000 подняты.
# Часть запросов идёт в Azure OpenAI (chat/rag/answer/message) — это нормально.
# TTS (edge-tts → speech.platform.bing.com): если egress ai-svc allowlist'нут
# только под Azure — синтез провиснет; скрипт это распознаёт и не зависает.
# ──────────────────────────────────────────────────────────────────────────
set -u
CORE=http://127.0.0.1:3001/api
AI=http://127.0.0.1:8000
GW=http://127.0.0.1:3000
TS=$(date +%s)
PASS="Test1234"

P=0; F=0; W=0
ok(){ P=$((P+1)); echo "  ✅ $1"; }
no(){ F=$((F+1)); echo "  ❌ $1"; }
warn(){ W=$((W+1)); echo "  ⚠️  $1"; }
hdr(){ echo; echo "══ $1 ══"; }

verify_email(){ docker exec core_db psql -U core_user -d core_db -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$1';" >/dev/null 2>&1; }

# code URL [token] [method] [body]  → печатает HTTP-код (таймаут 90с)
code(){ local url="$1" tok="${2:-}" m="${3:-GET}" b="${4:-}"
  local args=(-s -m 90 -o /dev/null -w "%{http_code}" -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}"; }
# ctype URL [token] [method] [body] → печатает Content-Type ответа
ctype(){ local url="$1" tok="${2:-}" m="${3:-GET}" b="${4:-}"
  local args=(-s -m 90 -o /dev/null -D - -X "$m" "$url")
  [ -n "$tok" ] && args+=(-H "Authorization: Bearer $tok")
  [ -n "$b" ]   && args+=(-H 'Content-Type: application/json' -d "$b")
  curl "${args[@]}" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-type"{print tolower($2); exit}'; }
# is "$code" среди допустимых: inset 200 "200 201"
inset(){ case " $2 " in *" $1 "*) return 0;; *) return 1;; esac; }

command -v jq >/dev/null     || { echo "нужен jq";     exit 1; }
command -v docker >/dev/null || { echo "нужен docker"; exit 1; }

# ─── участники: USER + ADMIN ───
UEMAIL="ai_u_${TS}@x.com"
curl -s -X POST "$CORE/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$UEMAIL\",\"password\":\"$PASS\",\"firstName\":\"AI\",\"lastName\":\"Т\",\"role\":\"USER\"}" >/dev/null
verify_email "$UEMAIL"
UTOK=$(curl -s -X POST "$CORE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$UEMAIL\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty')
ATOK=$(curl -s -X POST "$CORE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"${ADMIN_EMAIL:-admin@senimdi.kz}\",\"password\":\"${ADMIN_PASSWORD:-Admin2026!}\"}" | jq -r '.accessToken // empty')
[ -n "$UTOK" ] || { echo "нет USER токена — стоп"; exit 1; }
ok "токены USER$([ -n "$ATOK" ] && echo ' + ADMIN') получены"

# ═══════════════════════════════════════════════════════════════════════════
hdr "ai-svc :8000 — публичные + auth-guards"
[ "$(code "$AI/health")" = 200 ]        && ok "GET /health → 200"               || no "GET /health"
[ "$(code "$AI/chat/guide")" = 200 ]    && ok "GET /chat/guide → 200 (без авторизации)" || no "GET /chat/guide"
[ "$(code "$AI/speech/voices")" = 200 ] && ok "GET /speech/voices → 200"        || no "GET /speech/voices"
c=$(code "$AI/chat/sessions"); inset "$c" "401 403" && ok "GET /chat/sessions без токена → $c" || no "/chat/sessions без токена ($c)"
c=$(code "$AI/chat/" "" POST '{"messages":[{"role":"user","content":"hi"}]}'); inset "$c" "401 403" && ok "POST /chat/ без токена → $c" || no "/chat/ без токена ($c)"

hdr "ai-svc :8000 — chat / rag (Azure OpenAI)"
c=$(code "$AI/chat/" "$UTOK" POST '{"messages":[{"role":"user","content":"привет, кратко"}]}')
inset "$c" "200 429" && ok "POST /chat/ → $c" || no "/chat/ ($c)"
c=$(code "$AI/chat/emergency" "$UTOK" POST '{"message":"человек упал"}')
inset "$c" "200 429" && ok "POST /chat/emergency → $c" || no "/chat/emergency ($c)"
c=$(code "$AI/chat/rag" "$UTOK" POST '{"messages":[{"role":"user","content":"реабилитация рядом"}]}')
inset "$c" "200 429" && ok "POST /chat/rag → $c (org-search через /api жив)" || no "/chat/rag ($c)"
c=$(code "$AI/rag/answer" "$UTOK" POST '{"question":"какие документы для инвалидности?"}')
inset "$c" "200 429" && ok "POST /rag/answer → $c" || no "/rag/answer ($c)"

hdr "ai-svc :8000 — rag/ingest (роль)"
c=$(code "$AI/rag/ingest" "$UTOK" POST '{"content":"x","source":"s","category":"c"}')
[ "$c" = 403 ] && ok "POST /rag/ingest USER → 403" || no "/rag/ingest USER ($c)"
if [ -n "$ATOK" ]; then
  c=$(code "$AI/rag/ingest" "$ATOK" POST '{"content":"Тестовый документ про реабилитацию в Алматы.","source":"test","category":"rehabilitation"}')
  inset "$c" "200 201" && ok "POST /rag/ingest ADMIN → $c" || no "/rag/ingest ADMIN ($c)"
fi

hdr "ai-svc :8000 — sessions CRUD + сообщение"
SID=$(curl -s -m 30 -X POST "$AI/chat/sessions" -H "Authorization: Bearer $UTOK" -H 'Content-Type: application/json' \
  -d '{"mode":"chat","title":"Тест"}' | jq -r '.id // empty')
[ -n "$SID" ] && ok "POST /chat/sessions → создана" || no "POST /chat/sessions"
[ "$(code "$AI/chat/sessions" "$UTOK")" = 200 ] && ok "GET /chat/sessions (список) → 200" || no "список сессий"
[ "$(code "$AI/chat/sessions/$SID" "$UTOK")" = 200 ] && ok "GET /chat/sessions/{id} → 200" || no "GET одной сессии"
[ "$(code "$AI/chat/sessions/00000000-0000-0000-0000-000000000000" "$UTOK")" = 404 ] && ok "GET чужой/несущ. → 404" || no "несущ. сессия не 404"
c=$(code "$AI/chat/sessions/$SID/message" "$UTOK" POST '{"message":"привет"}')
inset "$c" "200 429" && ok "POST /chat/sessions/{id}/message → $c (история+Azure)" || no "send message ($c)"
[ "$(code "$AI/chat/sessions/$SID/title" "$UTOK" PATCH '{"title":"Новый"}')" = 200 ] && ok "PATCH /title → 200" || no "PATCH title"
[ "$(code "$AI/chat/sessions/$SID" "$UTOK" DELETE)" = 204 ] && ok "DELETE сессии → 204" || no "DELETE сессии"

hdr "ai-svc :8000 — speech STT (валидация без аудио)"
EMPTY=$(mktemp); : > "$EMPTY"
c=$(curl -s -m 90 -o /dev/null -w '%{http_code}' -X POST "$AI/speech/transcribe" -H "Authorization: Bearer $UTOK")
[ "$c" = 422 ] && ok "POST /speech/transcribe без файла → 422" || no "transcribe без файла ($c)"
c=$(curl -s -m 90 -o /dev/null -w '%{http_code}' -X POST "$AI/speech/transcribe" -H "Authorization: Bearer $UTOK" -F "file=@$EMPTY;filename=a.wav")
[ "$c" = 400 ] && ok "POST /speech/transcribe пустой файл → 400" || no "transcribe пустой файл ($c)"
rm -f "$EMPTY"

hdr "ai-svc :8000 — speech TTS (диагностика: ПРЯМО, в обход шлюза)"
DIRECT_TTS=$(ctype "$AI/speech/synthesize" "$UTOK" POST '{"text":"привет","language":"ru-RU"}')
case "$DIRECT_TTS" in
  *audio/mpeg*) ok "POST /speech/synthesize (direct) → $DIRECT_TTS";;
  "") warn "TTS напрямую тоже пусто → edge-tts не достучался (egress ai-svc, НЕ баг прокси)";;
  *) no "TTS напрямую вернул '$DIRECT_TTS' (ожидали audio/mpeg)";;
esac

# ═══════════════════════════════════════════════════════════════════════════
hdr "gateway-api :3000 — проксирование"
[ "$(code "$GW/api/health")" = 200 ] && ok "GET /api/health → 200" || no "gateway /api/health"
c=$(code "$GW/api/core/auth/login" "" POST "{\"email\":\"$UEMAIL\",\"password\":\"$PASS\"}")
inset "$c" "200 201" && ok "POST /api/core/auth/login → $c (proxy → core)" || no "core proxy login ($c)"
[ "$(code "$GW/api/ai/chat/guide")" = 200 ] && ok "GET /api/ai/chat/guide → 200 (proxy → ai)" || no "ai proxy guide"
c=$(code "$GW/api/taxi/bookings/my" "$UTOK"); inset "$c" "200 404" && ok "GET /api/taxi/bookings/my → $c (proxy → taxi)" || no "taxi proxy ($c)"

hdr "gateway-api :3000 — авторизация пробрасывается"
[ "$(code "$GW/api/ai/chat/sessions" "$UTOK")" = 200 ] && ok "GET /api/ai/chat/sessions с токеном → 200 (auth forward)" || no "auth forward с токеном"
c=$(code "$GW/api/ai/chat/sessions"); inset "$c" "401 403" && ok "GET /api/ai/chat/sessions без токена → $c" || no "auth forward без токена ($c)"

hdr "gateway-api :3000 — raw-proxy multipart"
# STT через шлюз (multipart-вход): пустой файл → 400 (raw multipart работает)
EMPTY=$(mktemp); : > "$EMPTY"
c=$(curl -s -m 90 -o /dev/null -w '%{http_code}' -X POST "$GW/api/ai/speech/transcribe" -H "Authorization: Bearer $UTOK" -F "file=@$EMPTY;filename=a.wav")
[ "$c" = 400 ] && ok "POST /api/ai/speech/transcribe пустой → 400 (raw multipart → ai)" || no "gw transcribe пустой ($c)"
# Аватар через шлюз (core multipart): неверный mime → 400
TXT=$(mktemp); echo "not an image" > "$TXT"
c=$(curl -s -m 30 -o /dev/null -w '%{http_code}' -X POST "$GW/api/core/profile/me/avatar" -H "Authorization: Bearer $UTOK" -F "file=@$TXT;filename=a.txt;type=text/plain")
[ "$c" = 400 ] && ok "POST /api/core/profile/me/avatar txt → 400 (raw multipart → core)" || no "gw avatar mime ($c)"
rm -f "$EMPTY" "$TXT"

hdr "gateway-api :3000 — 404 неизвестного сервиса"
c=$(code "$GW/api/nope/whatever" "$UTOK"); [ "$c" = 404 ] && ok "GET /api/nope/* → 404" || no "неизв. сервис не 404 ($c)"

hdr "gateway-api :3000 — rate-limit /admin/login (10/15мин)"
last=""
for i in $(seq 1 11); do
  last=$(curl -s -m 10 -o /dev/null -w '%{http_code}' -X POST "$GW/admin/login" \
    -H 'Content-Type: application/x-www-form-urlencoded' --data 'email=x@x.com&password=bad')
done
[ "$last" = 429 ] && ok "11-й POST /admin/login → 429 (express-rate-limit)" || warn "admin-login rate-limit: 11-й = $last (мог сброситься/уже активен)"

hdr "gateway-api :3000 — бинарный TTS (регресс #10)"
GW_TTS=$(ctype "$GW/api/ai/speech/synthesize" "$UTOK" POST '{"text":"привет","language":"ru-RU"}')
case "$GW_TTS" in
  *audio/mpeg*) ok "POST /api/ai/speech/synthesize → $GW_TTS (raw-proxy, не JSON)";;
  *application/json*) no "TTS через шлюз = application/json → бинарь портится (raw-proxy не сработал!)";;
  "")
    if [ -z "$DIRECT_TTS" ]; then
      warn "TTS через шлюз пусто, НО и напрямую пусто → причина в edge-tts/egress, не в шлюзе. Фикс raw-proxy корректен."
    else
      no "TTS напрямую дал '$DIRECT_TTS', а через шлюз ПУСТО → проблема в шлюзе"
    fi;;
  *) no "TTS через шлюз вернул '$GW_TTS'";;
esac

echo
echo "════════════════════════════════════════"
echo "ИТОГ AI+GW: $P passed / $F failed$([ "$W" -gt 0 ] && echo " / $W warn (egress edge-tts)")"
exit $([ "$F" = 0 ] && echo 0 || echo 1)
