import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E } from './helpers';

describe('Reviews (e2e) — отзывы об организациях и специалистах', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let orgId: string;
  const randomId = '00000000-0000-0000-0000-000000000000';

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    // создаём организацию, чтобы у GET-отзывов был реальный таргет
    const org = await prisma.organization.create({
      data: { nameRu: 'Тестовая организация (reviews)', status: 'VERIFIED' },
    });
    orgId = org.id;
  });

  afterAll(async () => {
    await prisma.orgReview.deleteMany({ where: { organizationId: orgId } }).catch(() => undefined);
    await prisma.organization.deleteMany({ where: { id: orgId } }).catch(() => undefined);
    await app.close();
  });

  it('POST /api/organizations/:id/reviews → 401 без токена', async () => {
    await request(http)
      .post(`/api/organizations/${orgId}/reviews`)
      .send({ rating: 5, comment: 'Отлично' })
      .expect(401);
  });

  it('GET /api/organizations/:id/reviews → 200 (публичный список)', async () => {
    const res = await request(http)
      .get(`/api/organizations/${orgId}/reviews`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('POST /api/specialists/:id/reviews → 401 без токена', async () => {
    await request(http)
      .post(`/api/specialists/${randomId}/reviews`)
      .send({ rating: 5 })
      .expect(401);
  });
});
