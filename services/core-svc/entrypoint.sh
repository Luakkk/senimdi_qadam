#!/bin/sh
set -e

echo "⏳ Running Prisma migrations..."
npx prisma migrate deploy
echo "✅ Migrations done"

exec node dist/main
