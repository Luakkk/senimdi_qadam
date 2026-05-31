import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

export interface E2EContext {
  app: INestApplication;
  prisma: PrismaService;
}

/**
 * Поднимает реальное Nest-приложение с той же глобальной конфигурацией,
 * что и main.ts (globalPrefix 'api' + ValidationPipe), и подменяет Resend
 * заглушкой, чтобы register() не пытался реально слать письмо.
 */
export async function bootstrapE2E(): Promise<E2EContext> {
  // eslint-disable-next-line no-console
  console.error('[e2e] compiling module...');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  // eslint-disable-next-line no-console
  console.error('[e2e] module compiled, creating app...');

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

  // eslint-disable-next-line no-console
  console.error('[e2e] calling app.init() (поднимаем onModuleInit всех модулей)...');
  await app.init();
  // eslint-disable-next-line no-console
  console.error('[e2e] app.init() OK');

  const prisma = app.get(PrismaService);
  return { app, prisma };
}

/** Уникальный email на каждый прогон, чтобы не ловить Conflict от прошлых тестов. */
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@test.kz`;
}
