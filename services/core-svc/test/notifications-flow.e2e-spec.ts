import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий уведомлений:
 * записи создаются внутри системы (личные + broadcast с userId=null).
 * Проверяем выдачу /my (личные + broadcast), счётчик непрочитанных,
 * фильтр unread, отметку одного и всех как прочитанных.
 */
describe('Notifications flow (e2e) — лента, непрочитанные, отметки', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let user: TestUser;
  let personalId: string;
  let personal2Id: string;
  let broadcastId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    user = await createUser(app, prisma, Role.USER, 'notif');

    const p1 = await prisma.notification.create({
      data: { userId: user.userId, title: 'Личное 1', body: 'тело', type: 'system' },
    });
    const p2 = await prisma.notification.create({
      data: { userId: user.userId, title: 'Личное 2', body: 'тело', type: 'system' },
    });
    const b = await prisma.notification.create({
      data: { userId: null, title: 'Рассылка', body: 'всем', type: 'news_published' },
    });
    personalId = p1.id;
    personal2Id = p2.id;
    broadcastId = b.id;
  });

  afterAll(async () => {
    await prisma.notification
      .deleteMany({ where: { id: { in: [personalId, personal2Id, broadcastId] } } })
      .catch(() => undefined);
    await prisma.user.deleteMany({ where: { id: user.userId } }).catch(() => undefined);
    await app.close();
  });

  it('/my возвращает личные и broadcast, unreadCount ≥ 3', async () => {
    const res = await request(http)
      .get('/api/notifications/my')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    const ids = (res.body.items as any[]).map((n) => n.id);
    expect(ids).toContain(personalId);
    expect(ids).toContain(broadcastId);
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(3);
  });

  it('фильтр unread=true возвращает только непрочитанные', async () => {
    const res = await request(http)
      .get('/api/notifications/my')
      .query({ unread: 'true' })
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect((res.body.items as any[]).every((n) => n.isRead === false)).toBe(true);
  });

  it('отметка одного уведомления прочитанным', async () => {
    const res = await request(http)
      .patch(`/api/notifications/${personalId}/read`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body.success).toBe(true);

    const list = await request(http)
      .get('/api/notifications/my')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    const read = (list.body.items as any[]).find((n) => n.id === personalId);
    expect(read.isRead).toBe(true);
  });

  it('отметить все прочитанными → unreadCount становится 0', async () => {
    const res = await request(http)
      .patch('/api/notifications/my/read-all')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(res.body.marked).toBeGreaterThanOrEqual(1);

    const list = await request(http)
      .get('/api/notifications/my')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(list.body.unreadCount).toBe(0);
  });
});
