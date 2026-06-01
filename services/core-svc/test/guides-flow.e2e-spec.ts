import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий гайдов:
 * ADMIN создаёт гайд (unpublished) → не виден публично → публикует →
 * виден в списке и карточке → лайк (toggle) → MODERATOR может создавать,
 * но не публиковать (только ADMIN) → снятие с публикации → снова 404.
 * Поля локализуются: titleRu→title, bodyRu→body.
 */
describe('Guides flow (e2e) — создание, публикация, лайки, права', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let admin: TestUser;
  let moderator: TestUser;
  let reader: TestUser;
  let guideId: string;
  let modGuideId: string;
  const title = `Гайд-${Date.now()}`;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    admin = await createUser(app, prisma, Role.ADMIN, 'guideadm');
    moderator = await createUser(app, prisma, Role.MODERATOR, 'guidemod');
    reader = await createUser(app, prisma, Role.USER, 'guideread');
  });

  afterAll(async () => {
    const ids = [guideId, modGuideId].filter(Boolean);
    await prisma.guideLike.deleteMany({ where: { guideId: { in: ids } } }).catch(() => undefined);
    await prisma.guide.deleteMany({ where: { id: { in: ids } } }).catch(() => undefined);
    await prisma.user
      .deleteMany({ where: { id: { in: [admin.userId, moderator.userId, reader.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  it('[USER] не может создать гайд → 403', async () => {
    await request(http)
      .post('/api/guides')
      .set('Authorization', `Bearer ${reader.token}`)
      .send({ titleRu: title, bodyRu: 'текст' })
      .expect(403);
  });

  it('[ADMIN] создаёт гайд → 201, по умолчанию не опубликован', async () => {
    const res = await request(http)
      .post('/api/guides')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ titleRu: title, bodyRu: 'Подробная инструкция.', category: 'legal', tags: ['док'] })
      .expect(201);
    guideId = res.body.id;
    expect(guideId).toBeDefined();
    expect(res.body.isPublished).toBe(false);
    expect(res.body.title).toBe(title);
  });

  it('неопубликованный гайд → карточка 404', async () => {
    await request(http).get(`/api/guides/${guideId}`).expect(404);
  });

  it('неопубликованного гайда нет в публичном списке', async () => {
    const res = await request(http).get('/api/guides').expect(200);
    expect((res.body.items as any[]).map((g) => g.id)).not.toContain(guideId);
  });

  it('[MODERATOR] не может публиковать → 403', async () => {
    await request(http)
      .patch(`/api/guides/${guideId}/publish`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .expect(403);
  });

  it('[ADMIN] публикует гайд → виден в списке и карточке', async () => {
    const res = await request(http)
      .patch(`/api/guides/${guideId}/publish`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(res.body.isPublished).toBe(true);

    const list = await request(http).get('/api/guides').expect(200);
    expect((list.body.items as any[]).map((g) => g.id)).toContain(guideId);

    const card = await request(http).get(`/api/guides/${guideId}`).expect(200);
    expect(card.body.title).toBe(title);
  });

  it('фильтр по категории возвращает гайд', async () => {
    const res = await request(http).get('/api/guides').query({ category: 'legal' }).expect(200);
    expect((res.body.items as any[]).map((g) => g.id)).toContain(guideId);
  });

  it('лайк (toggle): поставить → liked true', async () => {
    const res = await request(http)
      .post(`/api/guides/${guideId}/like`)
      .set('Authorization', `Bearer ${reader.token}`)
      .expect(201);
    expect(res.body.liked).toBe(true);

    const card = await request(http).get(`/api/guides/${guideId}`).expect(200);
    expect(card.body.likesCount).toBe(1);
  });

  it('лайк (toggle): повторно → liked false', async () => {
    const res = await request(http)
      .post(`/api/guides/${guideId}/like`)
      .set('Authorization', `Bearer ${reader.token}`)
      .expect(201);
    expect(res.body.liked).toBe(false);
  });

  it('[MODERATOR] может создать гайд (но он остаётся неопубликованным)', async () => {
    const res = await request(http)
      .post('/api/guides')
      .set('Authorization', `Bearer ${moderator.token}`)
      .send({ titleRu: `${title}-mod`, bodyRu: 'текст модератора' })
      .expect(201);
    modGuideId = res.body.id;
    expect(res.body.isPublished).toBe(false);
  });

  it('[ADMIN] снимает с публикации → снова 404', async () => {
    await request(http)
      .patch(`/api/guides/${guideId}/unpublish`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    await request(http).get(`/api/guides/${guideId}`).expect(404);
  });
});
