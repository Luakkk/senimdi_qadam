import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, uniqueEmail } from './helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const email = uniqueEmail('auth');
  const password = 'Test1234';

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();
  });

  afterAll(async () => {
    // подчищаем за собой
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    await app.close();
  });

  it('POST /api/auth/register → 201 и пара токенов', async () => {
    const res = await request(http)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Алуа', lastName: 'Тест', role: 'USER' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('POST /api/auth/register → 400 на слабый пароль (нет заглавной/цифры)', async () => {
    await request(http)
      .post('/api/auth/register')
      .send({ email: uniqueEmail('weak'), password: 'lowercase', firstName: 'A', lastName: 'B', role: 'USER' })
      .expect(400);
  });

  it('POST /api/auth/register → 400 при недопустимой роли (forbidNonWhitelisted/enum)', async () => {
    await request(http)
      .post('/api/auth/register')
      .send({ email: uniqueEmail('role'), password, firstName: 'A', lastName: 'B', role: 'ADMIN' })
      .expect(400);
  });

  it('POST /api/auth/login → 403 пока email не подтверждён', async () => {
    await request(http)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(403);
  });

  it('POST /api/auth/login → 200 после подтверждения email', async () => {
    // эмулируем переход по ссылке из письма
    await prisma.user.update({ where: { email }, data: { isVerified: true } });

    const res = await request(http)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('POST /api/auth/login → 401 на неверный пароль', async () => {
    await request(http)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPass1' })
      .expect(401);
  });

  it('полный цикл: login → /me → refresh → logout', async () => {
    const login = await request(http)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const { accessToken, refreshToken } = login.body;

    // /me — отдаёт профиль текущего пользователя
    const me = await request(http)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body.email).toBe(email);
    expect(me.body.passwordHash).toBeUndefined();

    // refresh — выдаёт новую пару токенов
    const refreshed = await request(http)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    expect(refreshed.body.accessToken).toBeDefined();

    // logout — инвалидирует refresh
    await request(http)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /api/auth/me → 401 без токена', async () => {
    await request(http).get('/api/auth/me').expect(401);
  });
});
