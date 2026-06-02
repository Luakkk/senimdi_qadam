#!/usr/bin/env bash
# Диагностика 500-ошибок ai-svc: печатает СЫРЫЕ тела ответов + хвост логов.
#   bash docs/diag_ai.sh
set -u
CORE=http://127.0.0.1:3001/api
AI=http://127.0.0.1:8000
TS=$(date +%s); PASS="Test1234"; E="diag_${TS}@x.com"

curl -s -X POST "$CORE/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$E\",\"password\":\"$PASS\",\"firstName\":\"D\",\"lastName\":\"T\",\"role\":\"USER\"}" >/dev/null
docker exec core_db psql -U core_user -d core_db -c "UPDATE \"User\" SET \"isVerified\"=true WHERE email='$E';" >/dev/null 2>&1
TOK=$(curl -s -X POST "$CORE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$E\",\"password\":\"$PASS\"}" | jq -r '.accessToken // empty')
echo "token: ${TOK:0:20}…"

echo; echo "── POST /rag/answer (embeddings) ──"
curl -s -m 60 -X POST "$AI/rag/answer" -H "Authorization: Bearer $TOK" \
  -H 'Content-Type: application/json' -d '{"question":"тест"}'; echo

echo; echo "── POST /speech/synthesize (edge-tts) ──"
curl -s -m 90 -X POST "$AI/speech/synthesize" -H "Authorization: Bearer $TOK" \
  -H 'Content-Type: application/json' -d '{"text":"привет","language":"ru-RU"}' | head -c 600; echo

echo; echo "── хвост логов ai_svc (ошибки) ──"
docker logs ai_svc --tail 80 2>&1 | grep -iE 'error|exception|traceback|embedding|deploy|edge|tts|403|404|status' | tail -30
