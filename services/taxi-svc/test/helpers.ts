import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';

export interface E2EContext {
  app: INestApplication;
}

/**
 * Поднимает реальное Nest-приложение taxi-svc с той же глобальной
 * конфигурацией, что и main.ts (ValidationPipe; глобального префикса нет).
 * Вебсокет-адаптер и Swagger в E2E не нужны.
 */
export async function bootstrapE2E(): Promise<E2EContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return { app };
}

/**
 * Минтим JWT тем же секретом, которым core-svc подписывает токены
 * (taxi-svc только верифицирует подпись и читает sub/email/role).
 */
export function signToken(
  role: 'USER' | 'TAXI_MANAGER' | 'ADMIN' = 'USER',
  sub = '00000000-0000-0000-0000-000000000001',
): string {
  return jwt.sign(
    { sub, email: `${role.toLowerCase()}@test.kz`, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' },
  );
}
