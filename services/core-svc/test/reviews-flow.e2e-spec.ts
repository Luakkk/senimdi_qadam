import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий отзывов:
 * отзывы на организацию (пересчёт ratingAvg/ratingCount, защита от дублей),
 * отзывы на специалиста (нельзя на себя, защита от дублей).
 */
describe('Reviews flow (e2e) — отзывы на организации и специалистов', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let userA: TestUser;
  let userB: TestUser;
  let specialist: TestUser;
  let orgId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    userA = await createUser(app, prisma, Role.USER, 'reva');
    userB = await createUser(app, prisma, Role.USER, 'revb');
    specialist = await createUser(app, prisma, Role.USER, 'revspec');

    const org = await prisma.organization.create({
      data: {
        nameRu: `RevOrg-${Date.now()}`,
        category: 'MEDICAL',
        city: 'Алматы',
        status: 'VERIFIED',
      },
    });
    orgId = org.id;
  });

  afterAll(async () => {
    await prisma.orgReview.deleteMany({ where: { organizationId: orgId } }).catch(() => undefined);
    await prisma.specialistReview
      .deleteMany({ where: { targetUserId: specialist.userId } })
      .catch(() => undefined);
    await prisma.organization.deleteMany({ where: { id: orgId } }).catch(() => undefined);
    await prisma.user
      .deleteMany({ where: { id: { in: [userA.userId, userB.userId, specialist.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  // ── Организации ─────────────────────────────────────────────────────────────

  it('отзыв на несуществующую организацию → 404', async () => {
    await request(http)
      .post('/api/organizations/00000000-0000-0000-0000-000000000000/reviews')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ rating: 5 })
      .expect(404);
  });

  it('userA оставляет отзыв (rating 4) → ratingAvg=4, ratingCount=1', async () => {
    await request(http)
      .post(`/api/organizations/${orgId}/reviews`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ rating: 4, comment: 'Хорошо' })
      .expect(201);

    const res = await request(http).get(`/api/organizations/${orgId}/reviews`).expect(200);
    expect(res.body.ratingCount).toBe(1);
    expect(res.body.ratingAvg).toBe(4);
    expect(res.body.total).toBe(1);
  });

  it('userB оставляет отзыв (rating 2) → ratingAvg=3, ratingCount=2', async () => {
    await request(http)
      .post(`/api/organizations/${orgId}/reviews`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ rating: 2 })
      .expect(201);

    const res = await request(http).get(`/api/organizations/${orgId}/reviews`).expect(200);
    expect(res.body.ratingCount).toBe(2);
    expect(res.body.ratingAvg).toBe(3);
  });

  it('повторный отзыв того же пользователя → 409', async () => {
    await request(http)
      .post(`/api/organizations/${orgId}/reviews`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ rating: 5 })
      .expect(409);
  });

  it('некорректный rating (>5) → 400', async () => {
    await request(http)
      .post(`/api/organizations/${orgId}/reviews`)
      .set('Authorization', `Bearer ${specialist.token}`)
      .send({ rating: 9 })
      .expect(400);
  });

  // ── Специалисты ─────────────────────────────────────────────────────────────

  it('нельзя оставить отзыв на себя → 400', async () => {
    await request(http)
      .post(`/api/specialists/${userA.userId}/reviews`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ rating: 5 })
      .expect(400);
  });

  it('userA оценивает специалиста (rating 5) → список содержит отзыв', async () => {
    await request(http)
      .post(`/api/specialists/${specialist.userId}/reviews`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ rating: 5, comment: 'Профессионал' })
      .expect(201);

    const res = await request(http).get(`/api/specialists/${specialist.userId}/reviews`).expect(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].rating).toBe(5);
  });

  it('повторный отзыв на того же специалиста → 409', async () => {
    await request(http)
      .post(`/api/specialists/${specialist.userId}/reviews`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ rating: 3 })
      .expect(409);
  });
});
