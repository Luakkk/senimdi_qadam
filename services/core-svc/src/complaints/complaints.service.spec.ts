import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role, ComplaintStatus } from '@prisma/client';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  complaint: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ComplaintsService', () => {
  let service: ComplaintsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
  });

  // ── create ────────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a complaint for the given user', async () => {
      mockPrisma.complaint.create.mockResolvedValue({
        id: 'c1', userId: 'user-1', targetType: 'organization',
        targetId: 'org-1', reason: 'Неверный адрес', status: ComplaintStatus.OPEN,
      });

      const result = await service.create(
        { targetType: 'organization', targetId: 'org-1', reason: 'Неверный адрес' } as any,
        'user-1',
      );

      expect(result.id).toBe('c1');
      expect(mockPrisma.complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            targetType: 'organization',
            targetId: 'org-1',
            reason: 'Неверный адрес',
            description: null,
          }),
        }),
      );
    });

    it('should pass through optional description', async () => {
      mockPrisma.complaint.create.mockResolvedValue({ id: 'c2' });

      await service.create(
        { targetType: 'user', targetId: 'u-9', reason: 'Спам', description: 'Подробности' } as any,
        'user-1',
      );

      expect(mockPrisma.complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ description: 'Подробности' }),
        }),
      );
    });
  });

  // ── listMy ────────────────────────────────────────────────────────────────────
  describe('listMy', () => {
    it('should return only complaints for the given user', async () => {
      mockPrisma.complaint.findMany.mockResolvedValue([{ id: 'c1', userId: 'user-1' }]);
      mockPrisma.complaint.count.mockResolvedValue(1);

      const result = await service.listMy('user-1', 20, 0);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('should throw NotFoundException for non-existent complaint', async () => {
      mockPrisma.complaint.findUnique.mockResolvedValue(null);

      await expect(service.getById('nope', 'user-1', Role.USER)).rejects.toThrow(NotFoundException);
    });

    it('should return complaint when user is the owner', async () => {
      mockPrisma.complaint.findUnique.mockResolvedValue({ id: 'c1', userId: 'user-1' });

      const result = await service.getById('c1', 'user-1', Role.USER);
      expect(result.id).toBe('c1');
    });

    it('should return complaint when user is ADMIN (even if not owner)', async () => {
      mockPrisma.complaint.findUnique.mockResolvedValue({ id: 'c1', userId: 'other' });

      const result = await service.getById('c1', 'admin', Role.ADMIN);
      expect(result.id).toBe('c1');
    });

    it('should return complaint when user is MODERATOR (even if not owner)', async () => {
      mockPrisma.complaint.findUnique.mockResolvedValue({ id: 'c1', userId: 'other' });

      const result = await service.getById('c1', 'mod', Role.MODERATOR);
      expect(result.id).toBe('c1');
    });

    it('should throw ForbiddenException when a regular USER accesses another user complaint', async () => {
      mockPrisma.complaint.findUnique.mockResolvedValue({ id: 'c1', userId: 'other' });

      await expect(service.getById('c1', 'user-1', Role.USER)).rejects.toThrow(ForbiddenException);
    });
  });

  // ── listAll ───────────────────────────────────────────────────────────────────
  describe('listAll', () => {
    it('should return all complaints with pagination', async () => {
      mockPrisma.complaint.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
      mockPrisma.complaint.count.mockResolvedValue(2);

      const result = await service.listAll(undefined, 20, 0);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('should filter by status when provided', async () => {
      mockPrisma.complaint.findMany.mockResolvedValue([{ id: 'c1', status: ComplaintStatus.UNDER_REVIEW }]);
      mockPrisma.complaint.count.mockResolvedValue(1);

      await service.listAll(ComplaintStatus.UNDER_REVIEW, 20, 0);

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: ComplaintStatus.UNDER_REVIEW } }),
      );
    });
  });

  // ── updateStatus ──────────────────────────────────────────────────────────────
  describe('updateStatus', () => {
    it('should throw NotFoundException for non-existent complaint', async () => {
      mockPrisma.complaint.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('nope', ComplaintStatus.RESOLVED)).rejects.toThrow(NotFoundException);
    });

    it('should update complaint status', async () => {
      mockPrisma.complaint.findUnique.mockResolvedValue({ id: 'c1', status: ComplaintStatus.OPEN });
      mockPrisma.complaint.update.mockResolvedValue({ id: 'c1', status: ComplaintStatus.RESOLVED });

      const result = await service.updateStatus('c1', ComplaintStatus.RESOLVED);

      expect(result.status).toBe(ComplaintStatus.RESOLVED);
      expect(mockPrisma.complaint.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'c1' }, data: { status: ComplaintStatus.RESOLVED } }),
      );
    });
  });
});
