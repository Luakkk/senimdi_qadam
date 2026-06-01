import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий обращений в поддержку (tickets):
 * пользователь создаёт тикет (OPEN) → видит в /my → чужой тикет недоступен →
 * админ видит в /all и меняет статус → автор видит обновлённый статус.
 */
describe('Tickets flow (e2e) — поддержка', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let author: TestUser;
  let other: TestUser;
  let admin: TestUser;
  let ticketId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    author = await createUser(app, prisma, Role.USER, 'tikauth');
    other = await createUser(app, prisma, Role.USER, 'tikoth');
    admin = await createUser(app, prisma, Role.ADMIN, 'tikadm');
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { id: ticketId } }).catch(() => undefined);
    await prisma.user
      .deleteMany({ where: { id: { in: [author.userId, other.userId, admin.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  it('создание тикета → 201, статус OPEN', async () => {
    const res = await request(http)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${author.token}`)
      .send({ subject: 'Помощь с документами', body: 'Подробное описание ситуации.' })
      .expect(201);
    ticketId = res.body.id;
    expect(ticketId).toBeDefined();
    expect(res.body.status).toBe('OPEN');
  });

  it('слишком короткий subject → 400', async () => {
    await request(http)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${author.token}`)
      .send({ subject: 'аб', body: 'тоже коротко' })
      .expect(400);
  });

  it('автор видит тикет в /my', async () => {
    const res = await request(http)
      .get('/api/tickets/my')
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((t) => t.id)).toContain(ticketId);
  });

  it('чужой пользователь не видит тикет → 403', async () => {
    await request(http)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .expect(403);
  });

  it('[USER] нет доступа к /all → 403', async () => {
    await request(http)
      .get('/api/tickets/all')
      .set('Authorization', `Bearer ${author.token}`)
      .expect(403);
  });

  it('[ADMIN] видит тикет в /all', async () => {
    const res = await request(http)
      .get('/api/tickets/all')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((t) => t.id)).toContain(ticketId);
  });

  it('[ADMIN] меняет статус → IN_PROGRESS', async () => {
    const res = await request(http)
      .patch(`/api/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('автор видит обновлённый статус', async () => {
    const res = await request(http)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });
});
