import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrapE2E, signToken } from './helpers';

describe('Recurring bookings (e2e) — guard-ы', () => {
  let app: INestApplication;
  let http: any;
  const userToken = signToken('USER');

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /bookings/recurring → 401 без токена', async () => {
    await request(http).get('/bookings/recurring').expect(401);
  });

  it('GET /bookings/recurring → 200 с токеном USER (мои регулярные поездки)', async () => {
    const res = await request(http)
      .get('/bookings/recurring')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });
});
