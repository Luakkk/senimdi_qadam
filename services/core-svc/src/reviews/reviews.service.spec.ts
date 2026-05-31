import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  organization: {
    findUnique: jest.fn(),
    update:     jest.fn(),
  },
  orgReview: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    count:      jest.fn(),
    aggregate:  jest.fn(),
  },
  specialistReview: {
    create:   jest.fn(),
    findMany: jest.fn(),
    count:    jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  // ── createOrgReview ───────────────────────────────────────────────────────────
  describe('createOrgReview', () => {
    it('should throw NotFoundException if organization does not exist', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrgReview('nonexistent-org', 'user-1', { rating: 5 } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create review and recalculate org rating', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-1' });
      mockPrisma.orgReview.create.mockResolvedValue({ id: 'rev-1', rating: 4, organizationId: 'org-1' });

      // Мокаем транзакцию — aggregate + update
      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          orgReview: {
            aggregate: jest.fn().mockResolvedValue({
              _avg: { rating: 4.5 },
              _count: { id: 2 },
            }),
          },
          organization: {
            update: jest.fn().mockResolvedValue({}),
          },
        }),
      );

      const result = await service.createOrgReview('org-1', 'user-1', { rating: 4 } as any);

      expect(result.id).toBe('rev-1');
      expect(mockPrisma.orgReview.create).toHaveBeenCalledTimes(1);
      // Транзакция должна быть вызвана для пересчёта рейтинга
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException on duplicate review (P2002)', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-1' });
      mockPrisma.orgReview.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.createOrgReview('org-1', 'user-1', { rating: 3 } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── listOrgReviews ────────────────────────────────────────────────────────────
  describe('listOrgReviews', () => {
    it('should return reviews with total and rating stats', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org-1', ratingAvg: 4.5, ratingCount: 10,
      });
      mockPrisma.orgReview.findMany.mockResolvedValue([
        { id: 'r1', rating: 5, comment: 'Отлично' },
        { id: 'r2', rating: 4, comment: 'Хорошо' },
      ]);
      mockPrisma.orgReview.count.mockResolvedValue(2);

      const result = await service.listOrgReviews('org-1', 20, 0);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.ratingAvg).toBe(4.5);
      expect(result.ratingCount).toBe(10);
    });

    it('should throw NotFoundException for non-existent organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      await expect(service.listOrgReviews('nonexistent', 20, 0)).rejects.toThrow(NotFoundException);
    });
  });

  // ── createSpecialistReview ────────────────────────────────────────────────────
  describe('createSpecialistReview', () => {
    it('should throw BadRequestException when reviewing yourself', async () => {
      await expect(
        service.createSpecialistReview('user-1', 'user-1', { rating: 5 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if specialist does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createSpecialistReview('specialist-1', 'user-1', { rating: 4 } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create specialist review successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'specialist-1' });
      mockPrisma.specialistReview.create.mockResolvedValue({
        id: 'sr-1', targetUserId: 'specialist-1', authorId: 'user-1', rating: 4,
      });

      const result = await service.createSpecialistReview('specialist-1', 'user-1', { rating: 4 } as any);

      expect(result.id).toBe('sr-1');
      expect(result.rating).toBe(4);
    });

    it('should throw ConflictException on duplicate specialist review (P2002)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'specialist-1' });
      mockPrisma.specialistReview.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.createSpecialistReview('specialist-1', 'user-1', { rating: 3 } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── listSpecialistReviews ─────────────────────────────────────────────────────
  describe('listSpecialistReviews', () => {
    it('should return paginated reviews with total', async () => {
      mockPrisma.specialistReview.findMany.mockResolvedValue([
        { id: 'sr-1', rating: 5, authorId: 'user-1' },
      ]);
      mockPrisma.specialistReview.count.mockResolvedValue(1);

      const result = await service.listSpecialistReviews('specialist-1', 20, 0);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
