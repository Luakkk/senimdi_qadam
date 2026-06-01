import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий организаций:
 * self-registration (USER → ORG_MANAGER) → портал менеджера (профиль, услуги,
 * аналитика) → каталог (только VERIFIED) → избранное у другого пользователя.
 */
describe('Organizations flow (e2e) — регистрация, портал, каталог, избранное', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;
  let http: any;

  let manager: TestUser;
  let visitor: TestUser;
  let orgId: string;
  let serviceId: string;
  const uniqueName = `ОргТест-${Date.now()}`;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    redis = app.get(RedisService);
    http = app.getHttpServer();

    manager = await createUser(app, prisma, undefined, 'orgmgr');
    visitor = await createUser(app, prisma, undefined, 'orgvis');
  });

  afterAll(async () => {
    await prisma.orgService.deleteMany({ where: { organizationId: orgId } }).catch(() => undefined);
    await prisma.savedOrganization.deleteMany({ where: { organizationId: orgId } }).catch(() => undefined);
    await prisma.organization.deleteMany({ where: { id: orgId } }).catch(() => undefined);
    await prisma.user.deleteMany({ where: { id: { in: [manager.userId, visitor.userId] } } }).catch(() => undefined);
    await app.close();
  });

  it('USER регистрирует организацию → 201, статус PENDING, роль повышается', async () => {
    const res = await request(http)
      .post('/api/organizations/register')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ nameRu: uniqueName, category: 'MEDICAL', city: 'Алматы', phone: '+77010000000' })
      .expect(201);
    orgId = res.body.organizationId;
    expect(orgId).toBeDefined();
    expect(res.body.status).toBe('PENDING');

    // роль в БД стала ORG_MANAGER — сбрасываем кэш user_ctx, чтобы guard это увидел
    const u = await prisma.user.findUnique({ where: { id: manager.userId } });
    expect(u!.role).toBe('ORG_MANAGER');
    await redis.del(`user_ctx:${manager.userId}`);
  });

  it('повторная регистрация той же организации → 409', async () => {
    await request(http)
      .post('/api/organizations/register')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ nameRu: 'Другая', category: 'MEDICAL' })
      .expect(409);
  });

  it('[ORG_MANAGER] GET /mine → 200 моя организация', async () => {
    const res = await request(http)
      .get('/api/organizations/mine')
      .set('Authorization', `Bearer ${manager.token}`)
      .expect(200);
    expect(res.body.id).toBe(orgId);
    expect(res.body.name).toBe(uniqueName);
  });

  it('[ORG_MANAGER] PATCH /mine → обновляет данные', async () => {
    const res = await request(http)
      .patch('/api/organizations/mine')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ phone: '+77019999999', description: 'Обновлённое описание' })
      .expect(200);
    expect(res.body.phone).toBe('+77019999999');
    expect(res.body.description).toBe('Обновлённое описание');
  });

  it('[ORG_MANAGER] CRUD услуг', async () => {
    const created = await request(http)
      .post('/api/organizations/mine/services')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ nameRu: 'Консультация логопеда', price: 5000 })
      .expect(201);
    serviceId = created.body.id;
    expect(serviceId).toBeDefined();

    const list = await request(http)
      .get('/api/organizations/mine/services')
      .set('Authorization', `Bearer ${manager.token}`)
      .expect(200);
    expect((list.body as any[]).map((s) => s.id)).toContain(serviceId);

    const updated = await request(http)
      .patch(`/api/organizations/mine/services/${serviceId}`)
      .set('Authorization', `Bearer ${manager.token}`)
      .send({ price: 6000 })
      .expect(200);
    expect(updated.body.price).toBe(6000);
  });

  it('каталог показывает только VERIFIED — PENDING не виден, после верификации виден', async () => {
    // пока PENDING — поиск по названию ничего не находит
    const before = await request(http)
      .get('/api/organizations')
      .query({ q: uniqueName })
      .expect(200);
    expect((before.body.items as any[]).map((o) => o.id)).not.toContain(orgId);

    // верифицируем напрямую (админ-флоу тестируется отдельно)
    await prisma.organization.update({ where: { id: orgId }, data: { status: 'VERIFIED' } });

    const after = await request(http)
      .get('/api/organizations')
      .query({ q: uniqueName })
      .expect(200);
    expect((after.body.items as any[]).map((o) => o.id)).toContain(orgId);
  });

  it('карточка организации по id → 200', async () => {
    const res = await request(http).get(`/api/organizations/${orgId}`).expect(200);
    expect(res.body.name).toBe(uniqueName);
  });

  it('другой пользователь сохраняет организацию в избранное', async () => {
    const res = await request(http)
      .post(`/api/organizations/${orgId}/save`)
      .set('Authorization', `Bearer ${visitor.token}`)
      .expect(201);
    expect(res.body.saved).toBe(true);
  });

  it('[ORG_MANAGER] аналитика отражает сохранение и активную услугу', async () => {
    const res = await request(http)
      .get('/api/organizations/mine/analytics')
      .set('Authorization', `Bearer ${manager.token}`)
      .expect(200);
    expect(res.body.savedByCount).toBeGreaterThanOrEqual(1);
    expect(res.body.activeServicesCount).toBeGreaterThanOrEqual(1);
  });

  it('[ORG_MANAGER] список сохранивших содержит посетителя', async () => {
    const res = await request(http)
      .get('/api/organizations/mine/saved-users')
      .set('Authorization', `Bearer ${manager.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((u) => u.id)).toContain(visitor.userId);
  });

  it('пользователь убирает организацию из избранного', async () => {
    const res = await request(http)
      .delete(`/api/organizations/${orgId}/save`)
      .set('Authorization', `Bearer ${visitor.token}`)
      .expect(200);
    expect(res.body.saved).toBe(false);
  });

  it('[ORG_MANAGER] удаление услуги → 200', async () => {
    await request(http)
      .delete(`/api/organizations/mine/services/${serviceId}`)
      .set('Authorization', `Bearer ${manager.token}`)
      .expect(200);
  });
});
