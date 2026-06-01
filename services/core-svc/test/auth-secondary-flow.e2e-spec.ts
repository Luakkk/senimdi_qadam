import * as request from 'supertest';
import * as speakeasy from 'speakeasy';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Вторичные сценарии auth:
 * 1) Сброс пароля: forgot-password → код в Redis → reset-password → вход новым паролем.
 * 2) resend-verification (анти-перебор: всегда нейтральный ответ).
 * 3) 2FA (TOTP): setup → verify (включение) → login требует 2FA → disable.
 */
describe('Auth secondary flow (e2e) — сброс пароля, 2FA, resend', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;
  let http: any;

  let resetUser: TestUser;
  let twoFaUser: TestUser;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    redis = app.get(RedisService);
    http = app.getHttpServer();

    resetUser = await createUser(app, prisma, Role.USER, 'rstpwd');
    twoFaUser = await createUser(app, prisma, Role.USER, 'twofa');
  });

  afterAll(async () => {
    await prisma.user
      .deleteMany({ where: { id: { in: [resetUser.userId, twoFaUser.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  // ── СБРОС ПАРОЛЯ ─────────────────────────────────────────────────────────
  it('forgot-password → 200 нейтральный ответ (код кладётся в Redis)', async () => {
    await request(http)
      .post('/api/auth/forgot-password')
      .send({ email: resetUser.email })
      .expect(200);

    const code = await redis.getResetCode(resetUser.email);
    expect(code).toBeTruthy();
    expect(code).toHaveLength(6);
  });

  it('forgot-password несуществующего email → 200 (не раскрываем наличие)', async () => {
    await request(http)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody-xyz@example.com' })
      .expect(200);
  });

  it('reset-password с неверным кодом → 400', async () => {
    await request(http)
      .post('/api/auth/reset-password')
      .send({ email: resetUser.email, code: '000000', newPassword: 'NewPass123' })
      .expect(400);
  });

  it('reset-password с верным кодом → 200, вход новым паролем работает', async () => {
    // Предыдущий тест с неверным кодом сжигает код (atomic GETDEL до сравнения),
    // поэтому запрашиваем свежий код.
    await request(http)
      .post('/api/auth/forgot-password')
      .send({ email: resetUser.email })
      .expect(200);
    const code = (await redis.getResetCode(resetUser.email)) as string;
    await request(http)
      .post('/api/auth/reset-password')
      .send({ email: resetUser.email, code, newPassword: 'NewPass123' })
      .expect(200);

    await request(http)
      .post('/api/auth/login')
      .send({ email: resetUser.email, password: 'NewPass123' })
      .expect(200);

    // Старый пароль больше не подходит
    await request(http)
      .post('/api/auth/login')
      .send({ email: resetUser.email, password: 'Test1234' })
      .expect(401);
  });

  // ── RESEND VERIFICATION ──────────────────────────────────────────────────
  it('resend-verification → 200 нейтральный ответ', async () => {
    await request(http)
      .post('/api/auth/resend-verification')
      .send({ email: 'someone@example.com' })
      .expect(200);
  });

  // ── 2FA (TOTP) ───────────────────────────────────────────────────────────
  it('2fa/setup возвращает secret и otpauth', async () => {
    const res = await request(http)
      .post('/api/auth/2fa/setup')
      .set('Authorization', `Bearer ${twoFaUser.token}`)
      .expect(201);
    expect(res.body.secret).toBeDefined();
    expect(res.body.otpauth).toContain('otpauth://');
    (twoFaUser as any).totpSecret = res.body.secret;
  });

  it('2fa/verify с неверным кодом → 400', async () => {
    await request(http)
      .post('/api/auth/2fa/verify')
      .set('Authorization', `Bearer ${twoFaUser.token}`)
      .send({ token: '000000' })
      .expect(400);
  });

  it('2fa/verify валидным TOTP → активируется', async () => {
    const token = speakeasy.totp({ secret: (twoFaUser as any).totpSecret, encoding: 'base32' });
    const res = await request(http)
      .post('/api/auth/2fa/verify')
      .set('Authorization', `Bearer ${twoFaUser.token}`)
      .send({ token })
      .expect(200);
    expect(res.body.message).toContain('2FA');

    const dbUser = await prisma.user.findUnique({ where: { id: twoFaUser.userId } });
    expect(dbUser?.isTotpEnabled).toBe(true);
  });

  it('login с включённым 2FA без кода → requiresTwoFactor', async () => {
    const res = await request(http)
      .post('/api/auth/login')
      .send({ email: twoFaUser.email, password: 'Test1234' })
      .expect(200);
    expect(res.body.requiresTwoFactor).toBe(true);
    expect(res.body.accessToken).toBeUndefined();
  });

  it('2fa/disable валидным TOTP → отключается', async () => {
    const token = speakeasy.totp({ secret: (twoFaUser as any).totpSecret, encoding: 'base32' });
    await request(http)
      .post('/api/auth/2fa/disable')
      .set('Authorization', `Bearer ${twoFaUser.token}`)
      .send({ token })
      .expect(200);

    const dbUser = await prisma.user.findUnique({ where: { id: twoFaUser.userId } });
    expect(dbUser?.isTotpEnabled).toBe(false);
  });
});
