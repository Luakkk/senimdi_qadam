#!/bin/sh
set -e

echo "⏳ Running Prisma migrations..."

# Run migrate deploy; if P3009 (failed migration stuck in DB), auto-resolve and retry once.
MIGRATE_OUT=$(npx prisma migrate deploy 2>&1) && echo "$MIGRATE_OUT" || {
  EXIT=$?
  echo "$MIGRATE_OUT"
  # Extract stuck migration name from error: The `<name>` migration started at ...
  STUCK=$(echo "$MIGRATE_OUT" | grep -oE "The \`[^\`]+\` migration" | head -1 | sed "s/The \`//;s/\` migration//")
  if [ -n "$STUCK" ]; then
    echo "⚠️  Auto-resolving stuck migration: $STUCK"
    npx prisma migrate resolve --rolled-back "$STUCK"
    npx prisma migrate deploy
  else
    exit $EXIT
  fi
}

echo "✅ Migrations done"

exec node dist/main
