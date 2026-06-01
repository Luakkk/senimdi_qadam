import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий жалоб (complaints):
 * пользователь подаёт жалобу (OPEN) → видит в /my → чужая недоступна →
 * админ видит в /all, фильтрует по статусу и меняет статус →
 * автор видит обновлённый статус.
 */
describe('Complaints flow (e2e) — жалобы', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let author: TestUser;
  let other: TestUser;
  let admin: TestUser;
  let orgId: string;
  let complaintId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    author = await createUser(app, prisma, Role.USER, 'cmpauth');
    other = await createUser(app, prisma, Role.USER, 'cmpoth');
    admin = await createUser(app, prisma, Role.ADMIN, 'cmpadm');

    const org = await prisma.organization.create({
      data: { nameRu: `CmpOrg-${Date.now()}`, category: 'MEDICAL', city: 'Алматы', status: 'VERIFIED' },
    });
    orgId = org.id;
  });

  afterAll(async () => {
    await prisma.complaint.deleteMany({ where: { id: complaintId } }).catch(() => undefined);
    await prisma.organization.deleteMany({ where: { id: orgId } }).catch(() => undefined);
    await prisma.user
      .deleteMany({ where: { id: { in: [author.userId, other.userId, admin.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  it('подача жалобы → 201, статус OPEN', async () => {
    const res = await request(http)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${author.token}`)
      .send({ targetType: 'organization', targetId: orgId, reason: 'Неверный адрес' })
      .expect(201);
    complaintId = res.body.id;
    expect(complaintId).toBeDefined();
    expect(res.body.status).toBe('OPEN');
  });

  it('некорректный targetType → 400', async () => {
    await request(http)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${author.token}`)
      .send({ targetType: 'spaceship', targetId: orgId, reason: 'тест' })
      .expect(400);
  });

  it('автор видит жалобу в /my', async () => {
    const res = await request(http)
      .get('/api/complaints/my')
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((c) => c.id)).toContain(complaintId);
  });

  it('чужой пользователь не видит жалобу → 403', async () => {
    await request(http)
      .get(`/api/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .expect(403);
  });

  it('[USER] нет доступа к /all → 403', async () => {
    await request(http)
      .get('/api/complaints/all')
      .set('Authorization', `Bearer ${author.token}`)
      .expect(403);
  });

  it('[ADMIN] видит жалобу в /all и фильтрует по статусу OPEN', async () => {
    const res = await request(http)
      .get('/api/complaints/all')
      .query({ status: 'OPEN' })
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((c) => c.id)).toContain(complaintId);
  });

  it('[ADMIN] меняет статус → UNDER_REVIEW', async () => {
    const res = await request(http)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'UNDER_REVIEW' })
      .expect(200);
    expect(res.body.status).toBe('UNDER_REVIEW');
  });

  it('фильтр по OPEN больше не возвращает жалобу', async () => {
    const res = await request(http)
      .get('/api/complaints/all')
      .query({ status: 'OPEN' })
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((c) => c.id)).not.toContain(complaintId);
  });

  it('автор видит обновлённый статус', async () => {
    const res = await request(http)
      .get(`/api/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);
    expect(res.body.status).toBe('UNDER_REVIEW');
  });
});
