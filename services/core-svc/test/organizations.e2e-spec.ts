import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, uniqueEmail } from './helpers';

describe('Organizations (e2e) — публичный доступ и guard-ы', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const email = uniqueEmail('org');
  const password = 'Test1234';
  let userToken: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    // создаём обычного USER-а, подтверждаем email и логинимся
    await request(http)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Орг', lastName: 'Тест', role: 'USER' });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    const login = await request(http)
      .post('/api/auth/login')
      .send({ email, password });
    userToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined);
    await app.close();
  });

  it('GET /api/organizations → 200 (публичный список)', async () => {
    const res = await request(http).get('/api/organizations').expect(200);
    // ответ — массив или пагинированный объект; главное, что эндпоинт открыт
    expect(res.body).toBeDefined();
  });

  it('GET /api/organizations/mine → 401 без токена', async () => {
    await request(http).get('/api/organizations/mine').expect(401);
  });

  it('GET /api/organizations/mine → 403 для роли USER (нужен ORG_MANAGER)', async () => {
    await request(http)
      .get('/api/organizations/mine')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
