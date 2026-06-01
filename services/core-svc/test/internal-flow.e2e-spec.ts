import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий internal/* (межсервисные вызовы).
 * Защита: заголовок X-Internal-Key === ADMIN_KEY + приватный IP (в тестах 127.0.0.1).
 * Проверяем: повышение до TAXI_MANAGER, личное и broadcast уведомление,
 * а также отказ без/с неверным ключом.
 */
describe('Internal flow (e2e) — межсервисные эндпоинты', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let user: TestUser;
  const KEY = process.env.ADMIN_KEY as string;
  const createdNotifIds: string[] = [];

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    user = await createUser(app, prisma, Role.USER, 'intusr');
  });

  afterAll(async () => {
    await prisma.notification
      .deleteMany({ where: { OR: [{ userId: user.userId }, { id: { in: createdNotifIds } }] } })
      .catch(() => undefined);
    await prisma.user.deleteMany({ where: { id: user.userId } }).catch(() => undefined);
    await app.close();
  });

  it('без X-Internal-Key → 401', async () => {
    await request(http)
      .patch(`/api/internal/users/${user.userId}/promote-taxi-manager`)
      .expect(401);
  });

  it('с неверным ключом → 401', async () => {
    await request(http)
      .patch(`/api/internal/users/${user.userId}/promote-taxi-manager`)
      .set('X-Internal-Key', 'wrong-key')
      .expect(401);
  });

  it('promote-taxi-manager → роль становится TAXI_MANAGER', async () => {
    const res = await request(http)
      .patch(`/api/internal/users/${user.userId}/promote-taxi-manager`)
      .set('X-Internal-Key', KEY)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.role).toBe('TAXI_MANAGER');

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    expect(dbUser?.role).toBe('TAXI_MANAGER');
  });

  it('promote несуществующего пользователя → 404', async () => {
    await request(http)
      .patch('/api/internal/users/00000000-0000-0000-0000-000000000000/promote-taxi-manager')
      .set('X-Internal-Key', KEY)
      .expect(404);
  });

  it('личное уведомление пользователю → создаётся', async () => {
    const res = await request(http)
      .post(`/api/internal/notifications/user/${user.userId}`)
      .set('X-Internal-Key', KEY)
      .send({ title: 'Заказ принят', body: 'Водитель назначен', type: 'taxi_booking' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.notificationId).toBeDefined();
    createdNotifIds.push(res.body.notificationId);

    const notif = await prisma.notification.findUnique({ where: { id: res.body.notificationId } });
    expect(notif?.userId).toBe(user.userId);
  });

  it('broadcast уведомление → создаётся с userId = null', async () => {
    const res = await request(http)
      .post('/api/internal/notifications/broadcast')
      .set('X-Internal-Key', KEY)
      .send({ title: 'Тех. работы', body: 'Сегодня в 22:00', type: 'system' })
      .expect(201);
    expect(res.body.broadcast).toBe(true);
    createdNotifIds.push(res.body.notificationId);

    const notif = await prisma.notification.findUnique({ where: { id: res.body.notificationId } });
    expect(notif?.userId).toBeNull();
  });
});
