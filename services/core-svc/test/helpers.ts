import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Role } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

export interface E2EContext {
  app: INestApplication;
  prisma: PrismaService;
}

export interface TestUser {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
}

/**
 * Поднимает реальное Nest-приложение с той же глобальной конфигурацией,
 * что и main.ts (globalPrefix 'api' + ValidationPipe), и подменяет Resend
 * заглушкой, чтобы register() не пытался реально слать письмо.
 */
export async function bootstrapE2E(): Promise<E2EContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ── Подмена Resend: письма в тестах не уходят ──────────────────────────────
  const authService = app.get(AuthService);
  (authService as any).resend = {
    emails: { send: async () => ({ id: 'test-email-id' }) },
  };

  await app.init();

  const prisma = app.get(PrismaService);
  return { app, prisma };
}

/** Уникальный email на каждый прогон, чтобы не ловить Conflict от прошлых тестов. */
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@test.kz`;
}

/**
 * Создаёт подтверждённого пользователя нужной роли и логинит его.
 * register разрешает только USER/RELATIVE, поэтому привилегированные роли
 * (ORG_MANAGER/MODERATOR/ADMIN) проставляем в БД и логинимся заново —
 * JWT-стратегия core-svc читает роль из БД на каждый запрос.
 * Возвращает токены и id. Email уникален — чистить можно по userId/email.
 */
export async function createUser(
  app: INestApplication,
  prisma: PrismaService,
  role: Role = Role.USER,
  prefix = 'u',
): Promise<TestUser> {
  const http = app.getHttpServer();
  const email = uniqueEmail(prefix);
  const password = 'Test1234';

  await request(http)
    .post('/api/auth/register')
    .send({ email, password, firstName: 'Тест', lastName: 'Юзер', role: 'USER' })
    .expect(201);

  await prisma.user.update({
    where: { email },
    data: { isVerified: true, ...(role !== Role.USER ? { role } : {}) },
  });

  const login = await request(http)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  const user = await prisma.user.findUnique({ where: { email } });
  return {
    token: login.body.accessToken,
    refreshToken: login.body.refreshToken,
    userId: user!.id,
    email,
  };
}
