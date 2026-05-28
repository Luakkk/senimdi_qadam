import 'dotenv/config';

// ── Sentry must be initialized before any other imports ───────────────────────
import * as Sentry from '@sentry/node';
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.2,
  });
}

import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers: X-Content-Type-Options, X-Frame-Options, CSP и др.
  app.use(helmet());

  // Разрешаем только конкретные источники (фронтенд + gateway).
  // origin: '*' небезопасен в продакшене.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',').map(o => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,  // 400 Bad Request если в запросе лишние поля
  }));

  const config = new DocumentBuilder()
    .setTitle('SenimdiQAdam — Taxi Service')
    .setDescription('Доступное такси для людей с инвалидностью')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Health endpoint for Docker Compose healthcheck
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'taxi-svc' });
  });

  // ── WebSocket: Socket.IO via NestJS platform adapter ──────────────────────
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚕 Taxi-svc running on http://localhost:${port}`);
  console.log(`🔌 WebSocket:   ws://localhost:${port}/taxi`);
  console.log(`📚 Swagger: http://localhost:${port}/docs`);
}
bootstrap();
