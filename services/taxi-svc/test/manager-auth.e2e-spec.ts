import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrapE2E, signToken } from './helpers';

describe('Manager-auth (e2e) — инвайты менеджеров, guard-ы', () => {
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

  it('POST /manager-auth/invite → 401 без токена', async () => {
    await request(http)
      .post('/manager-auth/invite')
      .send({ email: 'm@test.kz' })
      .expect(401);
  });

  it('POST /manager-auth/invite → 403 для роли USER (нужен ADMIN)', async () => {
    await request(http)
      .post('/manager-auth/invite')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'm@test.kz' })
      .expect(403);
  });

  it('GET /manager-auth/me → 401 без токена', async () => {
    await request(http).get('/manager-auth/me').expect(401);
  });
});
