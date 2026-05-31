import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrapE2E, signToken } from './helpers';

describe('Manager (e2e) — портал TAXI_MANAGER, guard-ы', () => {
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

  it('GET /manager/stats → 401 без токена', async () => {
    await request(http).get('/manager/stats').expect(401);
  });

  it('GET /manager/stats → 403 для роли USER (нужен TAXI_MANAGER/ADMIN)', async () => {
    await request(http)
      .get('/manager/stats')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('GET /manager/queue → 401 без токена', async () => {
    await request(http).get('/manager/queue').expect(401);
  });
});
