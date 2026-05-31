import { Test, TestingModule } from '@nestjs/testing';
import { GuidesService } from './guides.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  guide: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
  guideLike: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    delete:     jest.fn(),
  },
  $transaction: jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('GuidesService', () => {
  let service: GuidesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuidesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GuidesService>(GuidesService);
  });

  // ── list ──────────────────────────────────────────────────────────────────────
  describe('list', () => {
    it('should return only published guides', async () => {
      mockPrisma.guide.findMany.mockResolvedValue([{ id: 'g1' }]);
      mockPrisma.guide.count.mockResolvedValue(1);

      const result = await service.list();

      expect(result.items).toHaveLength(1);
      expect(mockPrisma.guide.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isPublished: true } }),
      );
    });

    it('should filter by category when provided', async () => {
      mockPrisma.guide.findMany.mockResolvedValue([]);
      mockPrisma.guide.count.mockResolvedValue(0);

      await service.list('mobility', 20, 0);

      expect(mockPrisma.guide.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isPublished: true, category: 'mobility' } }),
      );
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('should return a published guide', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue({ id: 'g1', isPublished: true });
      const result = await service.getById('g1');
      expect(result.id).toBe('g1');
    });

    it('should throw NotFoundException for non-existent guide', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue(null);
      await expect(service.getById('nope')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unpublished guide', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue({ id: 'g1', isPublished: false });
      await expect(service.getById('g1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a guide unpublished by default', async () => {
      mockPrisma.guide.create.mockResolvedValue({ id: 'g1', isPublished: false });

      await service.create({ titleRu: 'Гайд', bodyRu: 'Текст' } as any, 'author-1');

      expect(mockPrisma.guide.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titleRu: 'Гайд', authorId: 'author-1', isPublished: false, tags: [],
          }),
        }),
      );
    });
  });

  // ── setPublished ────────────────────────────────────────────────────────────────
  describe('setPublished', () => {
    it('should throw NotFoundException for missing guide', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue(null);
      await expect(service.setPublished('nope', true)).rejects.toThrow(NotFoundException);
    });

    it('should publish an existing guide', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue({ id: 'g1', isPublished: false });
      mockPrisma.guide.update.mockResolvedValue({ id: 'g1', isPublished: true });

      const result = await service.setPublished('g1', true);
      expect(result.isPublished).toBe(true);
      expect(mockPrisma.guide.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'g1' }, data: { isPublished: true } }),
      );
    });
  });

  // ── toggleLike ──────────────────────────────────────────────────────────────────
  describe('toggleLike', () => {
    it('should throw NotFoundException when guide is not published', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue({ id: 'g1', isPublished: false });
      await expect(service.toggleLike('g1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should add like when not yet liked', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue({ id: 'g1', isPublished: true });
      mockPrisma.guideLike.findUnique.mockResolvedValue(null);

      const result = await service.toggleLike('g1', 'u1');
      expect(result.liked).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should remove like when already liked', async () => {
      mockPrisma.guide.findUnique.mockResolvedValue({ id: 'g1', isPublished: true });
      mockPrisma.guideLike.findUnique.mockResolvedValue({ guideId: 'g1', userId: 'u1' });

      const result = await service.toggleLike('g1', 'u1');
      expect(result.liked).toBe(false);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
