FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# npm ci гарантирует точные версии из package-lock.json (детерминированный build)
RUN npm ci --legacy-peer-deps

ARG CACHEBUST=1
RUN echo "cache-bust: $CACHEBUST"
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY entrypoint.sh ./entrypoint.sh
COPY --from=builder /app/dist ./dist
RUN chmod +x entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
