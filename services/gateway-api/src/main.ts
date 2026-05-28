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
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers: защита от XSS, clickjacking и других атак
  app.use(helmet());

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',').map(o => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,   // 400 если в запросе лишние поля
  }));
  app.setGlobalPrefix('api');

  // ── Swagger ────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SenimdiQAdam API Gateway')
    .setDescription('Единая точка входа — прокси ко всем микросервисам')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ── Rate limiting on AdminJS panel (brute-force protection) ──────────────
  // NestJS ThrottlerModule only applies to NestJS controllers — AdminJS routes
  // bypass it. We apply express-rate-limit directly before AdminJS mounts.
  const adminLoginLimiter = rateLimit({
    windowMs:  15 * 60 * 1000, // 15 minutes
    max:       10,              // max 10 login attempts per 15 min per IP
    message:   { statusCode: 429, message: 'Too many login attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders:   false,
  });
  // Apply to /admin/login (POST) and /admin/api/login to cover both AdminJS routes
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  expressApp.use('/admin/login', adminLoginLimiter);
  expressApp.use('/admin/api/login', adminLoginLimiter);

  // ── Multipart raw proxy (file uploads) ────────────────────────────────────
  // Эти маршруты регистрируем ДО AdminJS, чтобы multipart шёл напрямую
  const coreSvcUrl = process.env.CORE_SVC_URL || 'http://localhost:3001';
  const aiSvcUrl   = process.env.AI_SVC_URL   || 'http://localhost:8000';

  expressApp.use('/api/core/profile/me/avatar',
    createProxyMiddleware({ target: coreSvcUrl, changeOrigin: true, pathRewrite: { '^/api/core': '' } }),
  );
  expressApp.use(/^\/api\/core\/news\/[^/]+\/image$/,
    createProxyMiddleware({ target: coreSvcUrl, changeOrigin: true, pathRewrite: { '^/api/core': '' } }),
  );
  expressApp.use('/api/ai/speech/transcribe',
    createProxyMiddleware({ target: aiSvcUrl, changeOrigin: true, pathRewrite: { '^/api/ai': '' } }),
  );

  // ── WebSocket proxy → taxi-svc (/taxi namespace) ──────────────────────────
  // Socket.IO upgrade requests cannot be forwarded by the NestJS HTTP proxy.
  // We attach a WS-aware proxy directly to the underlying HTTP server so that
  // ws://gateway:3000/taxi is transparently forwarded to ws://taxi-svc:3002/taxi
  const taxiSvcUrl = process.env.TAXI_SVC_URL || 'http://taxi-svc:3002';
  const wsProxy = createProxyMiddleware({
    target: taxiSvcUrl,
    changeOrigin: true,
    ws: true,          // enable WebSocket proxying
  });
  expressApp.use('/taxi', wsProxy);

  // After app.listen() we must also upgrade raw WS connections on the HTTP server
  // (NestJS's listen() returns the http.Server via getHttpServer())

  // NOTE: /admin — обслуживается AdminJS (зарегистрирован через AdminModule.forRoot())
  // Статическая раздача public/admin удалена — AdminJS сам рендерит UI

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Attach WebSocket upgrade handler so ws:// connections to /taxi are proxied
  app.getHttpServer().on('upgrade', wsProxy.upgrade);

  console.log(`🌐 Gateway:  http://localhost:${port}/api`);
  console.log(`🛡️  Admin:    http://localhost:${port}/admin`);
  console.log(`🔌 WS proxy: ws://localhost:${port}/taxi → ${taxiSvcUrl}`);
  console.log(`📚 Swagger:  http://localhost:${port}/api/docs`);
}
bootstrap();
