import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, uniqueEmail } from './helpers';

describe('Complaints (e2e) — жалобы и guard-ы', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const email = uniqueEmail('compl');
  const password = 'Test1234';
  let userToken: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    await request(http)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Жал', lastName: 'Тест', role: 'USER' });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    const login = await request(http).post('/api/auth/login').send({ email, password });
    userToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    await app.close();
  });

  it('POST /api/complaints → 401 без токена', async () => {
    await request(http)
      .post('/api/complaints')
      .send({ targetType: 'Organization', targetId: 'x', reason: 'спам' })
      .expect(401);
  });

  it('GET /api/complaints/my → 401 без токена', async () => {
    await request(http).get('/api/complaints/my').expect(401);
  });

  it('GET /api/complaints/all → 403 для роли USER (нужен ADMIN/MODERATOR)', async () => {
    await request(http)
      .get('/api/complaints/all')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
