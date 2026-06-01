import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { bootstrapE2E, createUser, TestUser } from './helpers';

/**
 * Функциональный сценарий новостей:
 * автор создаёт новость (PENDING) → не видна в ленте/карточке →
 * модератор публикует → видна → лайк (toggle) → комментарий
 * (PENDING → модерация → виден) → удаление комментария и новости.
 * Поля локализуются LanguageInterceptor: titleRu→title, bodyRu→body.
 */
describe('News flow (e2e) — создание, модерация, лайки, комментарии', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: any;

  let author: TestUser;
  let reader: TestUser;
  let moderator: TestUser;
  let newsId: string;
  let commentId: string;
  const title = `Новость-${Date.now()}`;

  beforeAll(async () => {
    const ctx = await bootstrapE2E();
    app = ctx.app;
    prisma = ctx.prisma;
    http = app.getHttpServer();

    author = await createUser(app, prisma, Role.USER, 'newsauth');
    reader = await createUser(app, prisma, Role.USER, 'newsread');
    moderator = await createUser(app, prisma, Role.MODERATOR, 'newsmod');
  });

  afterAll(async () => {
    await prisma.newsComment.deleteMany({ where: { newsId } }).catch(() => undefined);
    await prisma.newsLike.deleteMany({ where: { newsId } }).catch(() => undefined);
    await prisma.news.deleteMany({ where: { id: newsId } }).catch(() => undefined);
    await prisma.user
      .deleteMany({ where: { id: { in: [author.userId, reader.userId, moderator.userId] } } })
      .catch(() => undefined);
    await app.close();
  });

  it('автор создаёт новость → 201, статус PENDING', async () => {
    const res = await request(http)
      .post('/api/news')
      .set('Authorization', `Bearer ${author.token}`)
      .send({ titleRu: title, bodyRu: 'Подробный текст новости для теста.' })
      .expect(201);
    newsId = res.body.id;
    expect(newsId).toBeDefined();
    expect(res.body.status).toBe('PENDING');
    expect(res.body.title).toBe(title); // titleRu → title
  });

  it('PENDING-новость не отдаётся карточкой → 404', async () => {
    await request(http).get(`/api/news/${newsId}`).expect(404);
  });

  it('PENDING-новости нет в публичной ленте', async () => {
    const res = await request(http).get('/api/news').expect(200);
    expect((res.body.items as any[]).map((n) => n.id)).not.toContain(newsId);
  });

  it('[автор] моя новость видна в /my/list', async () => {
    const res = await request(http)
      .get('/api/news/my/list')
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((n) => n.id)).toContain(newsId);
  });

  it('[MODERATOR] новость в очереди модерации', async () => {
    const res = await request(http)
      .get('/api/news/moderation/pending')
      .set('Authorization', `Bearer ${moderator.token}`)
      .expect(200);
    expect((res.body.items as any[]).map((n) => n.id)).toContain(newsId);
  });

  it('[USER] не может модерировать → 403', async () => {
    await request(http)
      .patch(`/api/news/${newsId}/moderate`)
      .set('Authorization', `Bearer ${reader.token}`)
      .send({ status: 'PUBLISHED' })
      .expect(403);
  });

  it('[MODERATOR] публикует новость → PUBLISHED', async () => {
    const res = await request(http)
      .patch(`/api/news/${newsId}/moderate`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);
    expect(res.body.status).toBe('PUBLISHED');
    expect(res.body.publishedAt).not.toBeNull();
  });

  it('опубликованная новость видна в ленте и карточке', async () => {
    const list = await request(http).get('/api/news').expect(200);
    expect((list.body.items as any[]).map((n) => n.id)).toContain(newsId);

    const card = await request(http).get(`/api/news/${newsId}`).expect(200);
    expect(card.body.title).toBe(title);
  });

  it('повторная модерация уже опубликованной → 403', async () => {
    await request(http)
      .patch(`/api/news/${newsId}/moderate`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .send({ status: 'REJECTED' })
      .expect(403);
  });

  it('лайк (toggle): поставить → liked true, счётчик растёт', async () => {
    const res = await request(http)
      .post(`/api/news/${newsId}/like`)
      .set('Authorization', `Bearer ${reader.token}`)
      .expect(201);
    expect(res.body.liked).toBe(true);

    const card = await request(http).get(`/api/news/${newsId}`).expect(200);
    expect(card.body.likesCount).toBe(1);
  });

  it('лайк (toggle): повторно → liked false, счётчик падает', async () => {
    const res = await request(http)
      .post(`/api/news/${newsId}/like`)
      .set('Authorization', `Bearer ${reader.token}`)
      .expect(201);
    expect(res.body.liked).toBe(false);

    const card = await request(http).get(`/api/news/${newsId}`).expect(200);
    expect(card.body.likesCount).toBe(0);
  });

  it('комментарий → PENDING, не виден публично', async () => {
    const res = await request(http)
      .post(`/api/news/${newsId}/comments`)
      .set('Authorization', `Bearer ${reader.token}`)
      .send({ text: 'Спасибо за новость!' })
      .expect(201);
    commentId = res.body.id;
    expect(commentId).toBeDefined();
    expect(res.body.status).toBe('PENDING');

    const list = await request(http).get(`/api/news/${newsId}/comments`).expect(200);
    expect((list.body.items as any[]).map((c) => c.id)).not.toContain(commentId);
  });

  it('[MODERATOR] одобряет комментарий → виден, commentsCount=1', async () => {
    await request(http)
      .patch(`/api/news/comments/${commentId}/moderate`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);

    const list = await request(http).get(`/api/news/${newsId}/comments`).expect(200);
    expect((list.body.items as any[]).map((c) => c.id)).toContain(commentId);

    const card = await request(http).get(`/api/news/${newsId}`).expect(200);
    expect(card.body.commentsCount).toBe(1);
  });

  it('автор комментария удаляет его → 200', async () => {
    await request(http)
      .delete(`/api/news/${newsId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${reader.token}`)
      .expect(200);
  });

  it('[автор] удаляет новость → 200', async () => {
    await request(http)
      .delete(`/api/news/${newsId}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);
    await request(http).get(`/api/news/${newsId}`).expect(404);
  });
});
