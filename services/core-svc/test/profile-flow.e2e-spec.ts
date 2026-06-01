import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий профиля:
 * приватный профиль, обновление, публичный профиль (с фильтрацией приватных
 * полей), accessibility-настройки, геолокация, FCM device-token,
 * лайкнутые новости, relative-links (RELATIVE→USER), деактивация аккаунта.
 */
describe('Profile flow (e2e) — профиль, accessibility, links, устройства', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let user: TestUser;       // основной USER (он же dependent для links)
  let guardian: TestUser;   // RELATIVE
  let deact: TestUser;      // отдельный USER под деактивацию
  let newsId: string;
  let linkId: string;
  const deviceToken = `fcm-${Date.now()}`;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    user = await createUser(app, prisma, Role.USER, 'prof');
    guardian = await createUser(app, prisma, Role.RELATIVE, 'profrel');
    deact = await createUser(app, prisma, Role.USER, 'profdeact');

    // Готовим опубликованную новость, чтобы проверить liked-news
    const news = await prisma.news.create({
      data: {
        titleRu: `ProfNews-${Date.now()}`,
        bodyRu: 'тело',
        authorId: user.userId,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    newsId = news.id;
  });

  afterAll(async () => {
    await prisma.newsLike.deleteMany({ where: { newsId } }).catch(() => undefined);
    await prisma.news.deleteMany({ where: { id: newsId } }).catch(() => undefined);
    await prisma.relativeLink
      .deleteMany({ where: { OR: [{ guardianId: guardian.userId }, { dependentId: user.userId }] } })
      .catch(() => undefined);
    await prisma.deviceToken.deleteMany({ where: { userId: user.userId } }).catch(() => undefined);
    await prisma.userProfile
      .deleteMany({ where: { userId: { in: [user.userId, guardian.userId, deact.userId] } } })
      .catch(() => undefined);
    await prisma.user
      .deleteMany({ where: { id: { in: [user.userId, guardian.userId, deact.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  it('GET /me → 200, без passwordHash', async () => {
    const res = await request(http)
      .get('/api/profile/me')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body.id).toBe(user.userId);
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('PATCH /me → обновляет имя/город', async () => {
    const res = await request(http)
      .patch('/api/profile/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ firstName: 'Алуа', lastName: 'Сманова', city: 'Алматы' })
      .expect(200);
    expect(res.body.firstName).toBe('Алуа');
    expect(res.body.city).toBe('Алматы');
  });

  it('публичный профиль отдаёт имя, но не приватные поля', async () => {
    const res = await request(http).get(`/api/profile/${user.userId}`).expect(200);
    expect(res.body.firstName).toBe('Алуа');
    expect(res.body.role).toBe('USER');
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.email).toBeUndefined();
  });

  it('accessibility: дефолт пустой → обновление → читается', async () => {
    const def = await request(http)
      .get('/api/profile/me/accessibility')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(def.body.accessibilityPrefs).toEqual({});

    const upd = await request(http)
      .patch('/api/profile/me/accessibility')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ fontSize: 'large', contrast: 'high', tts: true })
      .expect(200);
    expect(upd.body.accessibilityPrefs.fontSize).toBe('large');

    const get = await request(http)
      .get('/api/profile/me/accessibility')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(get.body.accessibilityPrefs.tts).toBe(true);
  });

  it('геолокация обновляется', async () => {
    const res = await request(http)
      .patch('/api/profile/me/location')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ lat: 43.238, lon: 76.945 })
      .expect(200);
    expect(res.body.lat).toBe(43.238);
    expect(res.body.lon).toBe(76.945);
  });

  it('device-token: регистрация и удаление', async () => {
    const reg = await request(http)
      .post('/api/profile/me/device-token')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ token: deviceToken, platform: 'android' })
      .expect(201);
    expect(reg.body.registered).toBe(true);

    const del = await request(http)
      .delete('/api/profile/me/device-token')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ token: deviceToken, platform: 'android' })
      .expect(200);
    expect(del.body.unregistered).toBe(true);
  });

  it('liked-news отражает лайкнутую новость', async () => {
    await request(http)
      .post(`/api/news/${newsId}/like`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(201);

    const res = await request(http)
      .get('/api/profile/me/liked-news')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((n) => n.id)).toContain(newsId);
  });

  it('liked-guides пустой для нового пользователя', async () => {
    const res = await request(http)
      .get('/api/profile/me/liked-guides')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body.total).toBe(0);
  });

  // ── RELATIVE LINKS ────────────────────────────────────────────────────────

  it('[USER] не может создавать связку (только RELATIVE) → 403', async () => {
    await request(http)
      .post('/api/profile/links/request')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ dependentEmail: deact.email })
      .expect(403);
  });

  it('[RELATIVE] отправляет запрос на связку → isAccepted false', async () => {
    const res = await request(http)
      .post('/api/profile/links/request')
      .set('Authorization', `Bearer ${guardian.token}`)
      .send({ dependentEmail: user.email, label: 'мама' })
      .expect(201);
    linkId = res.body.id;
    expect(linkId).toBeDefined();
    expect(res.body.isAccepted).toBe(false);
  });

  it('повторный запрос той же связки → 400', async () => {
    await request(http)
      .post('/api/profile/links/request')
      .set('Authorization', `Bearer ${guardian.token}`)
      .send({ dependentEmail: user.email })
      .expect(400);
  });

  it('[USER] принимает связку → isAccepted true', async () => {
    const res = await request(http)
      .post(`/api/profile/links/accept/${linkId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(201);
    expect(res.body.isAccepted).toBe(true);
  });

  it('обе стороны видят связку в /links/my', async () => {
    const dep = await request(http)
      .get('/api/profile/links/my')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect((dep.body.asDependent as any[]).map((l) => l.id)).toContain(linkId);

    const gua = await request(http)
      .get('/api/profile/links/my')
      .set('Authorization', `Bearer ${guardian.token}`)
      .expect(200);
    expect((gua.body.asGuardian as any[]).map((l) => l.id)).toContain(linkId);
  });

  it('удаление связки → 200', async () => {
    await request(http)
      .delete(`/api/profile/links/${linkId}`)
      .set('Authorization', `Bearer ${guardian.token}`)
      .expect(200);
  });

  it('деактивация аккаунта → 200', async () => {
    const res = await request(http)
      .delete('/api/profile/me')
      .set('Authorization', `Bearer ${deact.token}`)
      .expect(200);
    expect(res.body.message).toContain('деактивирован');
  });
});
