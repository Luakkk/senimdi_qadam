import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, signToken } from './helpers';

/**
 * Функциональный CRUD регулярных поездок: создание по cron → список →
 * пауза → возобновление → удаление.
 */
describe('Recurring bookings flow (e2e) — CRUD расписания', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const USER_ID = '44444444-4444-4444-4444-444444444444';
  const userToken = signToken('USER', USER_ID);
  let recurringId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await prisma.recurringBooking.deleteMany({ where: { userId: USER_ID } }).catch(() => undefined);
    await app.close();
  });

  it('создание расписания (валидный cron) → 201, isActive + nextRunAt', async () => {
    const res = await request(http)
      .post('/bookings/recurring')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromAddress: 'Дом',
        toAddress: 'Центр реабилитации',
        disabilityType: 'WHEELCHAIR',
        cronExpression: '0 9 * * 1-5',
      })
      .expect(201);
    recurringId = res.body.id;
    expect(recurringId).toBeDefined();
    expect(res.body.isActive).toBe(true);
    expect(res.body.nextRunAt).toBeDefined();
  });

  it('невалидный cron → 400', async () => {
    await request(http)
      .post('/bookings/recurring')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromAddress: 'Дом',
        toAddress: 'Центр',
        disabilityType: 'WHEELCHAIR',
        cronExpression: 'не-cron',
      })
      .expect(400);
  });

  it('список моих расписаний содержит созданное', async () => {
    const res = await request(http)
      .get('/bookings/recurring')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect((res.body as any[]).map((r) => r.id)).toContain(recurringId);
  });

  it('пауза → isActive=false, nextRunAt=null', async () => {
    const res = await request(http)
      .patch(`/bookings/recurring/${recurringId}/pause`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.isActive).toBe(false);
    expect(res.body.nextRunAt).toBeNull();
  });

  it('возобновление → isActive=true, nextRunAt пересчитан', async () => {
    const res = await request(http)
      .patch(`/bookings/recurring/${recurringId}/resume`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.isActive).toBe(true);
    expect(res.body.nextRunAt).toBeDefined();
  });

  it('удаление → 200, в списке больше нет', async () => {
    await request(http)
      .delete(`/bookings/recurring/${recurringId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const res = await request(http)
      .get('/bookings/recurring')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect((res.body as any[]).map((r) => r.id)).not.toContain(recurringId);
  });
});
