import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrapE2E, signToken } from './helpers';

describe('Drivers (e2e) — публичный доступ и guard-ы', () => {
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

  it('GET /drivers → 200 (публичный список)', async () => {
    const res = await request(http).get('/drivers').expect(200);
    expect(res.body).toBeDefined();
  });

  it('POST /drivers → 401 без токена', async () => {
    await request(http).post('/drivers').send({ name: 'Водитель' }).expect(401);
  });

  it('POST /drivers → 403 для роли USER (нужен TAXI_MANAGER/ADMIN)', async () => {
    await request(http)
      .post('/drivers')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Водитель' })
      .expect(403);
  });
});
