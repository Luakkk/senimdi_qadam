import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, signToken } from './helpers';

/**
 * Полный happy-path ИнваТакси: менеджер с правильной ролью реально получает
 * доступ, заводит водителя; пользователь создаёт бронь; менеджер видит её в
 * очереди, назначает водителя; пользователь и менеджер обмениваются сообщениями
 * в чате. Проверяем не только guard-ы, но и что бизнес-логика работает.
 */
describe('Taxi flow (e2e) — полный сценарий брони и чата', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const USER_ID = '11111111-1111-1111-1111-111111111111';
  const MGR_USER_ID = '22222222-2222-2222-2222-222222222222';
  const userToken = signToken('USER', USER_ID);
  const mgrToken = signToken('TAXI_MANAGER', MGR_USER_ID);

  const stamp = Date.now();
  let driverId: string;
  let bookingId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    // менеджер уже зарегистрирован (профиль TaxiManager существует)
    await prisma.taxiManager.create({
      data: {
        userId: MGR_USER_ID,
        firstName: 'Менеджер',
        lastName: 'Тест',
        phone: `+7700${stamp.toString().slice(-7)}`,
      },
    });
  });

  afterAll(async () => {
    await prisma.driverReview.deleteMany({ where: { userId: USER_ID } }).catch(() => undefined);
    await prisma.bookingMessage.deleteMany({ where: { booking: { userId: USER_ID } } }).catch(() => undefined);
    await prisma.booking.deleteMany({ where: { userId: USER_ID } }).catch(() => undefined);
    await prisma.driver.deleteMany({ where: { id: driverId } }).catch(() => undefined);
    await prisma.taxiManager.deleteMany({ where: { userId: MGR_USER_ID } }).catch(() => undefined);
    await app.close();
  });

  it('менеджер (TAXI_MANAGER) реально получает доступ к порталу → 200', async () => {
    await request(http).get('/manager/stats').set('Authorization', `Bearer ${mgrToken}`).expect(200);
    await request(http).get('/manager/queue').set('Authorization', `Bearer ${mgrToken}`).expect(200);
    await request(http).get('/manager/drivers/available').set('Authorization', `Bearer ${mgrToken}`).expect(200);
  });

  it('менеджер заводит водителя → 201', async () => {
    const res = await request(http)
      .post('/drivers')
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({
        firstName: 'Иван',
        lastName: 'Петров',
        phone: `+7701${stamp.toString().slice(-7)}`,
        licensePlate: `777 TST ${stamp.toString().slice(-3)}`,
        vehicleType: 'WHEELCHAIR_VAN',
      })
      .expect(201);
    driverId = res.body.id;
    expect(driverId).toBeDefined();
  });

  it('пользователь создаёт бронь → 201', async () => {
    const res = await request(http)
      .post('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromAddress: 'ул. Абая 1, Алматы',
        toAddress: 'ул. Достык 10, Алматы',
        scheduledAt: '2026-12-01T10:00:00Z',
        disabilityType: 'WHEELCHAIR',
      })
      .expect(201);
    bookingId = res.body.id;
    expect(bookingId).toBeDefined();
  });

  it('менеджер видит бронь в очереди', async () => {
    const res = await request(http)
      .get('/manager/queue')
      .set('Authorization', `Bearer ${mgrToken}`)
      .expect(200);
    const ids = (res.body as any[]).map((b) => b.id);
    expect(ids).toContain(bookingId);
  });

  it('менеджер назначает водителя → бронь становится CONFIRMED', async () => {
    const res = await request(http)
      .patch(`/manager/bookings/${bookingId}/assign`)
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({ driverId })
      .expect(200);
    expect(res.body.driverId).toBe(driverId);
    expect(res.body.status).toBe('CONFIRMED');
  });

  it('пользователь пишет в чат → 201', async () => {
    await request(http)
      .post(`/chat/bookings/${bookingId}/messages`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Я буду у подъезда' })
      .expect(201);
  });

  it('менеджер читает чат и отвечает', async () => {
    const list = await request(http)
      .get(`/chat/manager/bookings/${bookingId}/messages`)
      .set('Authorization', `Bearer ${mgrToken}`)
      .expect(200);
    expect((list.body as any[]).length).toBeGreaterThanOrEqual(1);

    await request(http)
      .post(`/chat/manager/bookings/${bookingId}/messages`)
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({ text: 'Водитель будет через 10 минут' })
      .expect(201);
  });

  it('менеджер видит бронь в общем списке и в деталях', async () => {
    const all = await request(http)
      .get('/manager/bookings')
      .set('Authorization', `Bearer ${mgrToken}`)
      .expect(200);
    expect((all.body as any[]).map((b) => b.id)).toContain(bookingId);

    const detail = await request(http)
      .get(`/manager/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${mgrToken}`)
      .expect(200);
    expect(detail.body.id).toBe(bookingId);
    // в деталях должна быть переписка чата
    expect(Array.isArray(detail.body.messages)).toBe(true);
    expect((detail.body.messages as any[]).length).toBeGreaterThanOrEqual(2);
  });

  it('менеджер проводит бронь по статусам CONFIRMED → IN_PROGRESS → COMPLETED', async () => {
    const r1 = await request(http)
      .patch(`/manager/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);
    expect(r1.body.status).toBe('IN_PROGRESS');

    const r2 = await request(http)
      .patch(`/manager/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({ status: 'COMPLETED' })
      .expect(200);
    expect(r2.body.status).toBe('COMPLETED');
  });

  it('недопустимый переход статуса отклоняется → 403', async () => {
    // COMPLETED — финальный статус, дальше переходов нет
    await request(http)
      .patch(`/manager/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${mgrToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(403);
  });

  it('пользователь оставляет отзыв о водителе → рейтинг пересчитывается', async () => {
    await request(http)
      .post(`/drivers/bookings/${bookingId}/review`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Внимательный водитель' })
      .expect(201);

    // повторный отзыв по той же поездке запрещён → 409
    await request(http)
      .post(`/drivers/bookings/${bookingId}/review`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4 })
      .expect(409);

    // рейтинг водителя обновился
    const driver = await request(http).get(`/drivers/${driverId}`).expect(200);
    expect(driver.body.ratingAvg).toBe(5);
    expect(driver.body.ratingCount).toBe(1);
  });

  it('местоположение водителя недоступно (нет GPS в Redis) → available:false', async () => {
    const res = await request(http)
      .get(`/bookings/${bookingId}/driver-location`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.available).toBe(false);
  });

  it('менеджер меняет статус водителя → 200', async () => {
    const res = await request(http)
      .patch(`/drivers/${driverId}/status`)
      .query({ status: 'SUSPENDED' })
      .set('Authorization', `Bearer ${mgrToken}`)
      .expect(200);
    expect(res.body.status).toBe('SUSPENDED');
  });
});
