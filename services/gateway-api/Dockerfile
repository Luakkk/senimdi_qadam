FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

ARG CACHEBUST=1
RUN echo "cache-bust: $CACHEBUST"
COPY . .
# Генерируем оба Prisma клиента для AdminJS
RUN npm run prisma:generate
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# openssl нужен Prisma для определения версии OpenSSL на Alpine (3.x)
# без него Prisma не может определить версию и пытается загрузить 1.1.x движок
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 3000
CMD ["node", "dist/main"]
