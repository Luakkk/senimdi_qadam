import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, uniqueEmail } from './helpers';

describe('News (e2e) — публичный доступ и guard-ы', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const email = uniqueEmail('news');
  const password = 'Test1234';
  let userToken: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    await request(http)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Ньюс', lastName: 'Тест', role: 'USER' });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    const login = await request(http).post('/api/auth/login').send({ email, password });
    userToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    await app.close();
  });

  it('GET /api/news → 200 (публичная лента)', async () => {
    const res = await request(http).get('/api/news').expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /api/news/my/list → 401 без токена', async () => {
    await request(http).get('/api/news/my/list').expect(401);
  });

  it('GET /api/news/moderation/pending → 403 для роли USER', async () => {
    await request(http)
      .get('/api/news/moderation/pending')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('POST /api/news → 401 без токена', async () => {
    await request(http)
      .post('/api/news')
      .send({ titleRu: 'Заголовок', bodyRu: 'Текст' })
      .expect(401);
  });
});
