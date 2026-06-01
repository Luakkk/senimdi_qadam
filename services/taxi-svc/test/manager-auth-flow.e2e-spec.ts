import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, signToken } from './helpers';

/**
 * Функциональный сценарий авторизации менеджера:
 * админ генерирует инвайт-код → видит его в списке → пользователь
 * регистрируется по коду как менеджер → читает свой профиль.
 *
 * Примечание: registerWithInvite пытается промотировать роль в core-svc
 * (fetch с 3 retry). В E2E core-svc недоступен — вызов мягко падает в лог,
 * сам профиль менеджера создаётся. Поэтому шаг регистрации проходит.
 */
describe('Manager auth flow (e2e) — инвайт → регистрация менеджера', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const ADMIN_ID = '55555555-5555-5555-5555-555555555555';
  const NEW_MGR_ID = '66666666-6666-6666-6666-666666666666';
  const adminToken = signToken('ADMIN', ADMIN_ID);
  const newMgrToken = signToken('USER', NEW_MGR_ID);

  const stamp = Date.now();
  let inviteCode: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await prisma.taxiManager.deleteMany({ where: { userId: NEW_MGR_ID } }).catch(() => undefined);
    if (inviteCode) {
      await prisma.managerInvite.deleteMany({ where: { code: inviteCode } }).catch(() => undefined);
    }
    await app.close();
  });

  it('админ генерирует инвайт-код → 201', async () => {
    const res = await request(http)
      .post('/manager-auth/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    inviteCode = res.body.code;
    expect(inviteCode).toMatch(/^INVATXI-/);
    expect(res.body.expiresAt).toBeDefined();
  });

  it('админ видит инвайт в списке', async () => {
    const res = await request(http)
      .get('/manager-auth/invites')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect((res.body as any[]).map((i) => i.code)).toContain(inviteCode);
  });

  it('пользователь регистрируется как менеджер по коду → 201', async () => {
    const res = await request(http)
      .post('/manager-auth/register')
      .set('Authorization', `Bearer ${newMgrToken}`)
      .send({
        inviteCode,
        firstName: 'Айгерим',
        lastName: 'Тестова',
        phone: `+7702${stamp.toString().slice(-7)}`,
      })
      .expect(201);
    expect(res.body.manager.userId).toBe(NEW_MGR_ID);
  });

  it('повторное использование того же кода → 400', async () => {
    await request(http)
      .post('/manager-auth/register')
      .set('Authorization', `Bearer ${signToken('USER', '77777777-7777-7777-7777-777777777777')}`)
      .send({
        inviteCode,
        firstName: 'Другой',
        lastName: 'Юзер',
        phone: `+7703${stamp.toString().slice(-7)}`,
      })
      .expect(400);
  });

  it('новый менеджер читает свой профиль (me) → 200', async () => {
    const res = await request(http)
      .get('/manager-auth/me')
      .set('Authorization', `Bearer ${newMgrToken}`)
      .expect(200);
    expect(res.body.userId).toBe(NEW_MGR_ID);
    expect(res.body.firstName).toBe('Айгерим');
  });
});
