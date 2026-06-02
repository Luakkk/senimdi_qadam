#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# Прогон ВСЕХ тестов из docs/ по порядку, с паузами под rate-limit логина
# (10 логинов/мин/IP). Логи каждого скрипта → docs/.test-logs/.
#
#   bash docs/run_all.sh                 # всё, паузы 90с
#   GAP=120 bash docs/run_all.sh         # своя пауза между скриптами
#   ADMIN_PASSWORD='...' bash docs/run_all.sh
#
# Требует: docker, jq, node, curl. Стенд (core/taxi/ai/gateway) должен быть поднят.
# Идёт долго: внутри test_behavior.sh есть sleep 62 (throttle) и sleep 75 (cron).
# ──────────────────────────────────────────────────────────────────────────
set -u
cd "$(dirname "$0")/.."          # корень репо
GAP="${GAP:-90}"
LOGDIR="docs/.test-logs"
mkdir -p "$LOGDIR"

# bash | node : как запускать каждый файл
TESTS=(
  "bash docs/test_core.sh"
  "bash docs/test_taxi.sh"
  "bash docs/test_full.sh"
  "bash docs/test_roles.sh"
  "bash docs/test_capabilities.sh"
  "bash docs/test_security.sh"
  "bash docs/test_gaps.sh"
  "bash docs/test_behavior.sh"
  "node docs/test_ws.js"
  "bash docs/test_ai_gateway.sh"
)

GTOTAL_P=0; GTOTAL_F=0
declare -a SUMMARY

i=0; n=${#TESTS[@]}
for cmd in "${TESTS[@]}"; do
  i=$((i+1))
  name=$(echo "$cmd" | awk '{print $2}' | sed 's#docs/##')
  log="$LOGDIR/${name%.*}.log"
  echo
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "▶ [$i/$n] $cmd   (лог: $log)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  $cmd 2>&1 | tee "$log"

  # Извлекаем P/F из итоговой строки (два формата)
  line=$(grep -E 'прошло:|passed /' "$log" | tail -1)
  p=$(echo "$line" | grep -oE '[0-9]+' | sed -n '1p')
  f=$(echo "$line" | grep -oE '[0-9]+' | sed -n '2p')
  if [ -z "$line" ]; then
    SUMMARY+=("✖ $name — НЕ ДОШЁЛ до итога (см. лог; вероятно rate-limit/стенд)")
  else
    SUMMARY+=("$([ "${f:-1}" = 0 ] && echo '✅' || echo '❌') $name — ${p:-?} ok / ${f:-?} fail")
    GTOTAL_P=$((GTOTAL_P + ${p:-0}))
    GTOTAL_F=$((GTOTAL_F + ${f:-0}))
  fi

  if [ "$i" -lt "$n" ]; then
    echo "… пауза ${GAP}s (rate-limit логина)…"
    sleep "$GAP"
  fi
done

echo
echo "════════════════════ СВОДКА ════════════════════"
for s in "${SUMMARY[@]}"; do echo "  $s"; done
echo "─────────────────────────────────────────────────"
echo "  ВСЕГО: $GTOTAL_P passed / $GTOTAL_F failed"
echo "  Логи: $LOGDIR/"
echo "═════════════════════════════════════════════════"
exit $([ "$GTOTAL_F" = 0 ] && echo 0 || echo 1)
