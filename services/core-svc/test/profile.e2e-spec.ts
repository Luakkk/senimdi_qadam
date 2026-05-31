import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, uniqueEmail } from './helpers';

describe('Profile (e2e) — личный кабинет пользователя', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const email = uniqueEmail('prof');
  const password = 'Test1234';
  let userToken: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    await request(http)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Проф', lastName: 'Тест', role: 'USER' });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    const login = await request(http).post('/api/auth/login').send({ email, password });
    userToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    await app.close();
  });

  it('GET /api/profile/me → 401 без токена', async () => {
    await request(http).get('/api/profile/me').expect(401);
  });

  it('GET /api/profile/me → 200 с токеном', async () => {
    const res = await request(http)
      .get('/api/profile/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('PATCH /api/profile/me → 200 обновляет профиль', async () => {
    await request(http)
      .patch('/api/profile/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ firstName: 'Обновлённое', city: 'Алматы' })
      .expect(200);
  });

  it('GET /api/profile/me/liked-news → 200 с токеном', async () => {
    await request(http)
      .get('/api/profile/me/liked-news')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });
});
