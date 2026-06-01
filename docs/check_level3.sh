#!/usr/bin/env bash
# Ручной прогон уровня 3 — запускать на машине с поднятым стеком (docker compose up).
# Использование:
#   ADMIN_TOKEN=...  ./check_level3.sh
# ADMIN_TOKEN нужен только для блоков 3.2 и 4.5.

set -u
GW=http://localhost:3000/api
pass(){ echo "  ✅ $1"; }
fail(){ echo "  ❌ $1"; }
hdr(){ echo; echo "== $1 =="; }

# ── 1. Health ────────────────────────────────────────────────────────────
hdr "1 Health"
for u in "$GW/health" http://localhost:3001/api/health \
         http://localhost:3002/health http://localhost:8000/health; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$u")
  [ "$code" = "200" ] && pass "$u -> 200" || fail "$u -> $code"
done

# ── 2. Gateway proxy + JWT ───────────────────────────────────────────────
hdr "2 Gateway proxy / JWT"
curl -s -X POST $GW/core/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"t3@example.com","password":"Test1234","name":"Тест"}' >/dev/null
TOKEN=$(curl -s -X POST $GW/core/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"t3@example.com","password":"Test1234"}' | jq -r .accessToken)
[ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] && pass "login -> token" || { fail "login"; exit 1; }

curl -s $GW/core/organizations?limit=5 -H "Authorization: Bearer $TOKEN" | grep -q '"items"' \
  && pass "2.2 core proxy" || fail "2.2 core proxy"
curl -s $GW/core/profile/me -H "Authorization: Bearer $TOKEN" | grep -q '@' \
  && pass "2.3 JWT passthrough" || fail "2.3 JWT passthrough"
curl -s -o /dev/null -w "%{http_code}" $GW/taxi/health | grep -q 200 \
  && pass "2.4 taxi proxy" || fail "2.4 taxi proxy"
echo "  2.5 ai proxy:"; curl -s $GW/ai/chat/guide | head -c 200; echo
code=$(curl -s -o /dev/null -w "%{http_code}" $GW/core/profile/me)
[ "$code" = "401" ] && pass "2.6 no-token -> 401" || fail "2.6 no-token -> $code"

# ── 3. Multipart (нужны файлы avatar.jpg / sample.wav рядом) ─────────────
hdr "3 Multipart"
if [ -f avatar.jpg ]; then
  curl -s -X POST $GW/core/profile/me/avatar -H "Authorization: Bearer $TOKEN" \
    -F "file=@./avatar.jpg" | grep -q avatarUrl && pass "3.1 avatar" || fail "3.1 avatar"
else echo "  ⚠ 3.1 пропуск: нет avatar.jpg"; fi
if [ -f sample.wav ]; then
  echo "  3.3 STT:"; curl -s -X POST $GW/ai/speech/transcribe \
    -H "Authorization: Bearer $TOKEN" -F "file=@./sample.wav"; echo
else echo "  ⚠ 3.3 пропуск: нет sample.wav"; fi

# ── 4. AI ─────────────────────────────────────────────────────────────────
hdr "4 AI (реальный Azure)"
echo "  4.1 chat:"; curl -s -X POST $GW/ai/chat/ -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Привет, кто ты?"}]}' | head -c 300; echo
echo "  4.3 emergency:"; curl -s -X POST $GW/ai/chat/emergency -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"message":"человек потерял сознание"}' | head -c 300; echo
echo "  4.4 TTS -> tts.mp3:"; curl -s -X POST $GW/ai/speech/synthesize -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"text":"Здравствуйте"}' --output tts.mp3
file tts.mp3

# ── 6.3 AdminJS rate-limit ────────────────────────────────────────────────
hdr "6.3 Admin rate-limit (ждём 429 на 11-й попытке)"
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:3000/admin/login \
    -d 'email=wrong@x.com&password=bad'
done; echo

# ── 7.1 JWT blacklist ─────────────────────────────────────────────────────
hdr "7.1 logout blacklist"
curl -s -X POST $GW/core/auth/logout -H "Authorization: Bearer $TOKEN" >/dev/null
code=$(curl -s -o /dev/null -w "%{http_code}" $GW/core/profile/me -H "Authorization: Bearer $TOKEN")
[ "$code" = "401" ] && pass "7.1 token revoked -> 401" || fail "7.1 -> $code (ожидали 401)"

echo; echo "Готово. Блоки 4.2/4.5 (RAG), 5 (ws), 6.1/6.2 (admin UI) — проверь вручную."
