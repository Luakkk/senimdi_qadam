import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { bootstrapE2E, signToken } from './helpers';

describe('Chat (e2e) — guard-ы', () => {
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

  it('GET /chat/unread → 401 без токена', async () => {
    await request(http).get('/chat/unread').expect(401);
  });

  it('GET /chat/manager/unread → 403 для роли USER (нужен TAXI_MANAGER/ADMIN)', async () => {
    await request(http)
      .get('/chat/manager/unread')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
