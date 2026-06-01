import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, signToken } from './helpers';

/**
 * Функциональный сценарий пользователя: расчёт цены → создание брони →
 * детали → оплата (наличные) → отмена. Проверяем реальную бизнес-логику,
 * а не только guard-ы.
 */
describe('Bookings flow (e2e) — расчёт цены, оплата, отмена', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  const USER_ID = '33333333-3333-3333-3333-333333333333';
  const userToken = signToken('USER', USER_ID);
  let bookingId: string;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await prisma.paymentTransaction.deleteMany({ where: { userId: USER_ID } }).catch(() => undefined);
    await prisma.booking.deleteMany({ where: { userId: USER_ID } }).catch(() => undefined);
    await app.close();
  });

  it('расчёт стоимости поездки (estimate-price) → 200 с разбивкой', async () => {
    const res = await request(http)
      .get('/bookings/estimate-price')
      .query({ fromLat: 43.238, fromLon: 76.889, toLat: 43.255, toLon: 76.94, disabilityType: 'WHEELCHAIR' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.price).toBeGreaterThan(0);
    // base 800 + надбавка за кресло 300 как минимум
    expect(res.body.breakdown.base).toBe(800);
    expect(res.body.breakdown.surcharge).toBe(300);
  });

  it('пользователь создаёт бронь с координатами → 201, есть estimatedPrice', async () => {
    const res = await request(http)
      .post('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromAddress: 'ул. Абая 1',
        toAddress: 'ул. Достык 10',
        fromLat: 43.238,
        fromLon: 76.889,
        toLat: 43.255,
        toLon: 76.94,
        scheduledAt: '2026-12-05T09:00:00Z',
        disabilityType: 'WHEELCHAIR',
      })
      .expect(201);
    bookingId = res.body.id;
    expect(bookingId).toBeDefined();
    expect(res.body.estimatedPrice).toBeGreaterThan(0);
  });

  it('детали брони (getOne) → 200 с массивом сообщений', async () => {
    const res = await request(http)
      .get(`/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.id).toBe(bookingId);
    expect(Array.isArray(res.body.messages)).toBe(true);
  });

  it('оплата наличными → статус PAID', async () => {
    const res = await request(http)
      .post(`/bookings/${bookingId}/payment`)
      .query({ method: 'CASH' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);
    expect(res.body.status).toBe('PAID');
  });

  it('повторная оплата уже оплаченной брони → 400', async () => {
    await request(http)
      .post(`/bookings/${bookingId}/payment`)
      .query({ method: 'CASH' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);
  });

  it('отмена брони → 200, статус CANCELLED', async () => {
    const res = await request(http)
      .patch(`/bookings/${bookingId}/cancel`)
      .query({ reason: 'Передумал' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.status).toBe('CANCELLED');
  });

  it('нельзя оплатить отменённую бронь → 400', async () => {
    await request(http)
      .post(`/bookings/${bookingId}/payment`)
      .query({ method: 'CASH' })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);
  });
});
