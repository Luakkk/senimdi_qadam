import 'dotenv/config';

// ── Sentry must be initialized before any other imports ───────────────────────
import * as Sentry from '@sentry/node';
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.2,  // sample 20% of transactions in production
  });
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security headers (highload: защита от XSS, clickjacking и т.д.)
  app.use(helmet());

  // ── CORS (origin берётся из env, не захардкожен — иначе prod не работает)
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  });

  app.setGlobalPrefix('api');

  // ── Глобальная валидация DTO (highload: отсеиваем мусор до бизнес-логики)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ── Swagger UI с поддержкой JWT (кнопка Authorize 🔒)
  const config = new DocumentBuilder()
    .setTitle('SenimdiQAdam Core API')
    .setDescription('Каталог организаций · Auth · Геопоиск · Отзывы · Новости')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`✅ Core API:   http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`📖 Swagger:    http://localhost:${port}/api/docs`);
}
bootstrap();
