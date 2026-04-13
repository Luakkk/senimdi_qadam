import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security headers (highload: защита от XSS, clickjacking и т.д.)
  app.use(helmet());

  // ── CORS (разрешаем запросы с фронтенда)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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
