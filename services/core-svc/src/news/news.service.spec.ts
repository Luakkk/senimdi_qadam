import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from '../fcm/fcm.service';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { NewsStatus, NewsCommentStatus, Role } from '@prisma/client';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  news: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
  newsLike: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    delete:     jest.fn(),
  },
  newsComment: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockFcm = {
  send:          jest.fn().mockResolvedValue(undefined),
  sendMulticast: jest.fn().mockResolvedValue(undefined),
  broadcastToAll: jest.fn().mockResolvedValue(undefined),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('NewsService', () => {
  let service: NewsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FcmService,    useValue: mockFcm },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  // ── listPublished ─────────────────────────────────────────────────────────────
  describe('listPublished', () => {
    it('should return only PUBLISHED news', async () => {
      const news = [
        { id: 'n1', titleRu: 'Заголовок 1', status: 'PUBLISHED', publishedAt: new Date() },
        { id: 'n2', titleRu: 'Заголовок 2', status: 'PUBLISHED', publishedAt: new Date() },
      ];
      mockPrisma.news.findMany.mockResolvedValue(news);

      const result = await service.listPublished(20, 'latest');

      expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: NewsStatus.PUBLISHED } }),
      );
      expect(result.items).toHaveLength(2);
    });

    it('should sort by likesCount desc when sort=popular', async () => {
      mockPrisma.news.findMany.mockResolvedValue([]);

      await service.listPublished(20, 'popular');

      expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([{ likesCount: 'desc' }]),
        }),
      );
    });

    it('should sort by publishedAt desc when sort=latest', async () => {
      mockPrisma.news.findMany.mockResolvedValue([]);

      await service.listPublished(20, 'latest');

      expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([{ publishedAt: 'desc' }]),
        }),
      );
    });

    it('should return nextCursor when there are more items', async () => {
      // fetch one extra (limit+1) to detect next page
      const news = Array.from({ length: 21 }, (_, i) => ({
        id: `n${i}`, titleRu: `Новость ${i}`, publishedAt: new Date(),
      }));
      mockPrisma.news.findMany.mockResolvedValue(news);

      const result = await service.listPublished(20, 'latest');

      expect(result.items).toHaveLength(20);
      expect(result.nextCursor).toBeDefined();
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('should return PUBLISHED news by id', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({
        id: 'n1', titleRu: 'Новость', status: NewsStatus.PUBLISHED, author: {},
      });

      const result = await service.getById('n1');
      expect(result.id).toBe('n1');
    });

    it('should throw NotFoundException for non-existent news', async () => {
      mockPrisma.news.findUnique.mockResolvedValue(null);

      await expect(service.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for PENDING news (not published)', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({
        id: 'n1', status: NewsStatus.PENDING,
      });

      await expect(service.getById('n1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create news with PENDING status', async () => {
      mockPrisma.news.create.mockResolvedValue({
        id: 'n1', titleRu: 'Новая новость', status: NewsStatus.PENDING, authorId: 'user-1',
      });

      const result = await service.create(
        { titleRu: 'Новая новость', bodyRu: 'Текст' } as any,
        'user-1',
      );

      expect(result.status).toBe(NewsStatus.PENDING);
      expect(mockPrisma.news.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: NewsStatus.PENDING, authorId: 'user-1' }),
        }),
      );
    });

    it('should sanitize HTML body before saving (XSS prevention)', async () => {
      mockPrisma.news.create.mockResolvedValue({
        id: 'n1', status: NewsStatus.PENDING, authorId: 'user-1',
      });

      await service.create(
        { titleRu: 'Тест', bodyRu: '<script>alert("xss")</script>Нормальный текст' } as any,
        'user-1',
      );

      // DOMPurify должен удалить <script> тег
      const callArgs = mockPrisma.news.create.mock.calls[0][0];
      expect(callArgs.data.bodyRu).not.toContain('<script>');
      expect(callArgs.data.bodyRu).toContain('Нормальный текст');
    });
  });

  // ── moderate ──────────────────────────────────────────────────────────────────
  describe('moderate', () => {
    it('should publish news and set publishedAt', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({
        id: 'n1', status: NewsStatus.PENDING, authorId: 'author-1',
      });
      mockPrisma.news.update.mockResolvedValue({
        id: 'n1', status: NewsStatus.PUBLISHED, publishedAt: new Date(),
      });

      const result = await service.moderate(
        'n1',
        { status: NewsStatus.PUBLISHED } as any,
        Role.MODERATOR,
      );

      expect(result.status).toBe(NewsStatus.PUBLISHED);
      expect(mockPrisma.news.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: NewsStatus.PUBLISHED }),
        }),
      );
    });

    it('should reject news with REJECTED status', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({
        id: 'n1', status: NewsStatus.PENDING,
      });
      mockPrisma.news.update.mockResolvedValue({
        id: 'n1', status: NewsStatus.REJECTED,
      });

      const result = await service.moderate(
        'n1',
        { status: NewsStatus.REJECTED } as any,
        Role.ADMIN,
      );

      expect(result.status).toBe(NewsStatus.REJECTED);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should allow author to delete their news', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({
        id: 'n1', authorId: 'user-1', imageUrl: null,
      });
      mockPrisma.news.delete.mockResolvedValue({});

      await service.remove('n1', 'user-1', Role.USER);

      expect(mockPrisma.news.delete).toHaveBeenCalledWith({ where: { id: 'n1' } });
    });

    it('should allow ADMIN to delete any news', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({
        id: 'n1', authorId: 'other-user', imageUrl: null,
      });
      mockPrisma.news.delete.mockResolvedValue({});

      await service.remove('n1', 'admin-user', Role.ADMIN);

      expect(mockPrisma.news.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException when non-author non-admin tries to delete', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({
        id: 'n1', authorId: 'other-user',
      });

      await expect(service.remove('n1', 'random-user', Role.USER)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent news', async () => {
      mockPrisma.news.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1', Role.USER)).rejects.toThrow(NotFoundException);
    });
  });

  // ── toggleLike ────────────────────────────────────────────────────────────────
  describe('toggleLike', () => {
    it('should add like when not yet liked', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({ id: 'n1', status: NewsStatus.PUBLISHED });
      mockPrisma.newsLike.findUnique.mockResolvedValue(null);
      mockPrisma.newsLike.create.mockResolvedValue({});
      mockPrisma.news.update.mockResolvedValue({ id: 'n1', likesCount: 1 });

      const result = await service.toggleLike('n1', 'user-1');

      expect(mockPrisma.newsLike.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('liked', true);
    });

    it('should remove like when already liked (toggle)', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({ id: 'n1', status: NewsStatus.PUBLISHED });
      mockPrisma.newsLike.findUnique.mockResolvedValue({ newsId: 'n1', userId: 'user-1' });
      mockPrisma.newsLike.delete.mockResolvedValue({});
      mockPrisma.news.update.mockResolvedValue({ id: 'n1', likesCount: 0 });

      const result = await service.toggleLike('n1', 'user-1');

      expect(mockPrisma.newsLike.delete).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('liked', false);
    });
  });

  // ── createComment ─────────────────────────────────────────────────────────────
  describe('createComment', () => {
    it('should create comment with PENDING status', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({ id: 'n1', status: NewsStatus.PUBLISHED });
      mockPrisma.newsComment.create.mockResolvedValue({
        id: 'c1', newsId: 'n1', userId: 'user-1',
        status: NewsCommentStatus.PENDING, body: 'Хороший материал!',
      });

      const result = await service.createComment('n1', 'user-1', { body: 'Хороший материал!' } as any);

      expect(result.status).toBe(NewsCommentStatus.PENDING);
    });
  });

  // ── listComments ──────────────────────────────────────────────────────────────
  describe('listComments', () => {
    it('should return only PUBLISHED comments', async () => {
      mockPrisma.newsComment.findMany.mockResolvedValue([
        { id: 'c1', text: 'Опубликованный', status: 'PUBLISHED' },
      ]);
      mockPrisma.newsComment.count.mockResolvedValue(1);

      await service.listComments('n1', 20, 0);

      expect(mockPrisma.newsComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: NewsCommentStatus.PUBLISHED }),
        }),
      );
    });
  });

  // ── deleteComment ─────────────────────────────────────────────────────────────
  describe('deleteComment', () => {
    it('should allow comment author to delete their comment', async () => {
      mockPrisma.newsComment.findUnique.mockResolvedValue({
        id: 'c1', authorId: 'user-1',
      });
      mockPrisma.newsComment.delete.mockResolvedValue({});

      await service.deleteComment('c1', 'user-1', Role.USER);

      expect(mockPrisma.newsComment.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });

    it('should throw ForbiddenException when non-author non-moderator tries to delete', async () => {
      mockPrisma.newsComment.findUnique.mockResolvedValue({
        id: 'c1', authorId: 'other-user',
      });

      await expect(service.deleteComment('c1', 'random-user', Role.USER)).rejects.toThrow(ForbiddenException);
    });
  });
});
