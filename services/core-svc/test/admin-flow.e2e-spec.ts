import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий админ-панели (admin/*):
 * organizations — создание, список с фильтрами, verify (PENDING→VERIFIED пишет
 * verificationLog + audit-запись ORG_VERIFIED), logs, удаление (только ADMIN);
 * news — статистика, список по статусу, модерация, удаление (только ADMIN);
 * users — список, смена роли (только ADMIN, MODERATOR→403), бан/разбан;
 * audit — лог действий админа содержит ORG_VERIFIED.
 */
describe('Admin flow (e2e) — админ-панель', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let admin: TestUser;
  let moderator: TestUser;
  let target: TestUser; // обычный пользователь для операций над ним

  let orgId: string;
  let newsId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    admin = await createUser(app, prisma, Role.ADMIN, 'admadm');
    moderator = await createUser(app, prisma, Role.MODERATOR, 'admmod');
    target = await createUser(app, prisma, Role.USER, 'admtgt');

    // Новость в статусе PENDING для модерации/статистики
    const news = await prisma.news.create({
      data: {
        titleRu: 'Админ-новость',
        bodyRu: 'тело',
        status: 'PENDING',
        authorId: target.userId,
      },
    });
    newsId = news.id;
  });

  afterAll(async () => {
    await prisma.verificationLog.deleteMany({ where: { organizationId: orgId } }).catch(() => undefined);
    await prisma.auditLog.deleteMany({ where: { actorId: admin.userId } }).catch(() => undefined);
    await prisma.news.deleteMany({ where: { id: newsId } }).catch(() => undefined);
    await prisma.organization.deleteMany({ where: { id: orgId } }).catch(() => undefined);
    await prisma.user
      .deleteMany({ where: { id: { in: [admin.userId, moderator.userId, target.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  // ── ORGANIZATIONS ──────────────────────────────────────────────────────
  it('[ADMIN] создаёт организацию → статус по умолчанию PENDING', async () => {
    const res = await request(http)
      .post('/api/admin/organizations')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ nameRu: `AdmOrg-${Date.now()}`, category: 'MEDICAL', city: 'Алматы' })
      .expect(201);
    orgId = res.body.id;
    expect(orgId).toBeDefined();
    expect(res.body.status).toBe('PENDING');
  });

  it('[USER] нет доступа к admin/organizations → 403', async () => {
    await request(http)
      .get('/api/admin/organizations')
      .set('Authorization', `Bearer ${target.token}`)
      .expect(403);
  });

  it('[ADMIN] список с фильтром status=PENDING содержит созданную', async () => {
    const res = await request(http)
      .get('/api/admin/organizations')
      .query({ status: 'PENDING' })
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((o) => o.id)).toContain(orgId);
    expect(typeof res.body.total).toBe('number');
  });

  it('[ADMIN] детали организации', async () => {
    const res = await request(http)
      .get(`/api/admin/organizations/${orgId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(res.body.id).toBe(orgId);
  });

  it('[ADMIN] verify PENDING→VERIFIED', async () => {
    const res = await request(http)
      .patch(`/api/admin/organizations/${orgId}/verify`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ method: 'call', statusTo: 'VERIFIED', comment: 'проверено' })
      .expect(200);
    expect(res.body.status).toBe('VERIFIED');
  });

  it('[ADMIN] лог верификации содержит запись VERIFIED', async () => {
    const res = await request(http)
      .get(`/api/admin/organizations/${orgId}/logs`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const logs = res.body as any[];
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs.some((l) => l.statusTo === 'VERIFIED')).toBe(true);
  });

  it('[MODERATOR] не может удалить организацию → 403', async () => {
    await request(http)
      .delete(`/api/admin/organizations/${orgId}`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .expect(403);
  });

  // ── NEWS ───────────────────────────────────────────────────────────────
  it('[ADMIN] статистика новостей возвращает счётчики по статусам', async () => {
    const res = await request(http)
      .get('/api/admin/news/stats')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(res.body.PENDING).toBeGreaterThanOrEqual(1);
  });

  it('[ADMIN] список новостей со статусом PENDING содержит нашу', async () => {
    const res = await request(http)
      .get('/api/admin/news')
      .query({ status: 'PENDING' })
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((n) => n.id)).toContain(newsId);
  });

  it('[ADMIN] модерация новости → PUBLISHED', async () => {
    const res = await request(http)
      .patch(`/api/admin/news/${newsId}/moderate`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);
    expect(res.body.status).toBe('PUBLISHED');
  });

  it('[MODERATOR] не может удалить новость → 403', async () => {
    await request(http)
      .delete(`/api/admin/news/${newsId}`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .expect(403);
  });

  // ── USERS ──────────────────────────────────────────────────────────────
  it('[ADMIN] список пользователей содержит target', async () => {
    const res = await request(http)
      .get('/api/admin/users')
      .query({ q: target.email })
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((u) => u.id)).toContain(target.userId);
  });

  it('[MODERATOR] не может менять роль → 403', async () => {
    await request(http)
      .patch(`/api/admin/users/${target.userId}/role`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .send({ role: 'MODERATOR' })
      .expect(403);
  });

  it('[ADMIN] меняет роль пользователя → ORG_MANAGER', async () => {
    const res = await request(http)
      .patch(`/api/admin/users/${target.userId}/role`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ role: 'ORG_MANAGER' })
      .expect(200);
    expect(res.body.role).toBe('ORG_MANAGER');
  });

  it('[ADMIN] бан/разбан переключает isActive', async () => {
    const banned = await request(http)
      .patch(`/api/admin/users/${target.userId}/ban`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(banned.body.isActive).toBe(false);

    const unbanned = await request(http)
      .patch(`/api/admin/users/${target.userId}/ban`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(unbanned.body.isActive).toBe(true);
  });

  // ── AUDIT ──────────────────────────────────────────────────────────────
  it('[ADMIN] аудит-лог содержит запись ORG_VERIFIED', async () => {
    const res = await request(http)
      .get('/api/admin/audit')
      .query({ action: 'ORG_VERIFIED' })
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect((res.body.items as any[]).some((l) => l.targetId === orgId)).toBe(true);
  });
});
