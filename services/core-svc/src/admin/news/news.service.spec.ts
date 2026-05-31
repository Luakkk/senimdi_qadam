import { Test, TestingModule } from '@nestjs/testing';
import { AdminNewsService } from './news.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { NewsStatus } from '@prisma/client';

const mockPrisma = {
  news: {
    count:      jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    groupBy:    jest.fn(),
  },
};

describe('AdminNewsService', () => {
  let service: AdminNewsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminNewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AdminNewsService>(AdminNewsService);
  });

  describe('findAll', () => {
    it('should return paginated news', async () => {
      mockPrisma.news.count.mockResolvedValue(1);
      mockPrisma.news.findMany.mockResolvedValue([{ id: 'n1' }]);
      const result = await service.findAll({ limit: 20, offset: 0 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockPrisma.news.count.mockResolvedValue(0);
      mockPrisma.news.findMany.mockResolvedValue([]);
      await service.findAll({ status: NewsStatus.PENDING, limit: 20, offset: 0 });
      expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: NewsStatus.PENDING }) }),
      );
    });
  });

  describe('stats', () => {
    it('should reduce groupBy results into a status→count map', async () => {
      mockPrisma.news.groupBy.mockResolvedValue([
        { status: 'PENDING',   _count: { _all: 3 } },
        { status: 'PUBLISHED', _count: { _all: 7 } },
      ]);
      const result = await service.stats();
      expect(result).toEqual({ PENDING: 3, PUBLISHED: 7 });
    });
  });

  describe('moderate', () => {
    it('should throw NotFoundException for missing news', async () => {
      mockPrisma.news.findUnique.mockResolvedValue(null);
      await expect(service.moderate('nope', { status: NewsStatus.PUBLISHED } as any)).rejects.toThrow(NotFoundException);
    });

    it('should set publishedAt when publishing', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({ id: 'n1', publishedAt: null });
      mockPrisma.news.update.mockResolvedValue({ id: 'n1', status: NewsStatus.PUBLISHED });

      await service.moderate('n1', { status: NewsStatus.PUBLISHED } as any);

      const callArgs = mockPrisma.news.update.mock.calls[0][0];
      expect(callArgs.data.status).toBe(NewsStatus.PUBLISHED);
      expect(callArgs.data.publishedAt).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for missing news', async () => {
      mockPrisma.news.findUnique.mockResolvedValue(null);
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });

    it('should delete existing news', async () => {
      mockPrisma.news.findUnique.mockResolvedValue({ id: 'n1' });
      mockPrisma.news.delete.mockResolvedValue({});
      const result = await service.remove('n1');
      expect(result).toHaveProperty('message');
      expect(mockPrisma.news.delete).toHaveBeenCalledWith({ where: { id: 'n1' } });
    });
  });
});
