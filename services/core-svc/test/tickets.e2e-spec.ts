import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, uniqueEmail } from './helpers';

describe('Tickets (e2e) — обращения в поддержку и guard-ы', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const email = uniqueEmail('tick');
  const password = 'Test1234';
  let userToken: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    await request(http)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Тикет', lastName: 'Тест', role: 'USER' });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    const login = await request(http).post('/api/auth/login').send({ email, password });
    userToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { user: { email } } }).catch(() => undefined);
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    await app.close();
  });

  it('POST /api/tickets → 401 без токена', async () => {
    await request(http)
      .post('/api/tickets')
      .send({ subject: 'Проблема', body: 'Описание' })
      .expect(401);
  });

  it('GET /api/tickets/my → 401 без токена', async () => {
    await request(http).get('/api/tickets/my').expect(401);
  });

  it('GET /api/tickets/all → 403 для роли USER (нужен ADMIN/MODERATOR)', async () => {
    await request(http)
      .get('/api/tickets/all')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
