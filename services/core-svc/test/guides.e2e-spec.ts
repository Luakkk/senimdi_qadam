import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, uniqueEmail } from './helpers';

describe('Guides (e2e) — публичный доступ и guard-ы', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const email = uniqueEmail('guide');
  const password = 'Test1234';
  let userToken: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    await request(http)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Гайд', lastName: 'Тест', role: 'USER' });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    const login = await request(http).post('/api/auth/login').send({ email, password });
    userToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    await app.close();
  });

  it('GET /api/guides → 200 (публичный список)', async () => {
    const res = await request(http).get('/api/guides').expect(200);
    expect(res.body).toBeDefined();
  });

  it('POST /api/guides → 401 без токена', async () => {
    await request(http)
      .post('/api/guides')
      .send({ titleRu: 'Гайд', bodyRu: 'Текст' })
      .expect(401);
  });

  it('POST /api/guides → 403 для роли USER (нужен ADMIN/MODERATOR)', async () => {
    await request(http)
      .post('/api/guides')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ titleRu: 'Гайд', bodyRu: 'Текст' })
      .expect(403);
  });
});
