import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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

  // ── Multipart raw proxy (file uploads) ────────────────────────────────────
  // Эти маршруты регистрируем ДО AdminJS, чтобы multipart шёл напрямую
  const coreSvcUrl = process.env.CORE_SVC_URL || 'http://localhost:3001';
  const aiSvcUrl   = process.env.AI_SVC_URL   || 'http://localhost:8000';
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;

  expressApp.use('/api/core/profile/me/avatar',
    createProxyMiddleware({ target: coreSvcUrl, changeOrigin: true, pathRewrite: { '^/api/core': '' } }),
  );
  expressApp.use(/^\/api\/core\/news\/[^/]+\/image$/,
    createProxyMiddleware({ target: coreSvcUrl, changeOrigin: true, pathRewrite: { '^/api/core': '' } }),
  );
  expressApp.use('/api/ai/speech/transcribe',
    createProxyMiddleware({ target: aiSvcUrl, changeOrigin: true, pathRewrite: { '^/api/ai': '' } }),
  );

  // NOTE: /admin — обслуживается AdminJS (зарегистрирован через AdminModule.forRoot())
  // Статическая раздача public/admin удалена — AdminJS сам рендерит UI

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🌐 Gateway:  http://localhost:${port}/api`);
  console.log(`🛡️  Admin:    http://localhost:${port}/admin`);
  console.log(`📚 Swagger:  http://localhost:${port}/api/docs`);
}
bootstrap();
