FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Генерируем оба Prisma клиента для AdminJS
RUN npm run prisma:generate
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 3000
CMD ["node", "dist/main"]
