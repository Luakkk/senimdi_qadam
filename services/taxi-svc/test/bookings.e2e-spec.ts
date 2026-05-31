import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrapE2E, signToken } from './helpers';

describe('Bookings (e2e) — guard-ы и доступ', () => {
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

  it('GET /bookings/my → 401 без токена', async () => {
    await request(http).get('/bookings/my').expect(401);
  });

  it('GET /bookings/my → 200 с токеном USER (свои поездки)', async () => {
    const res = await request(http)
      .get('/bookings/my')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('POST /bookings → 401 без токена', async () => {
    await request(http)
      .post('/bookings')
      .send({ fromAddress: 'A', toAddress: 'B' })
      .expect(401);
  });
});
