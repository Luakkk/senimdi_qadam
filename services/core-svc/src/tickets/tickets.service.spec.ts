import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role, TicketStatus } from '@prisma/client';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  ticket: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  // ── create ────────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a ticket for the given user', async () => {
      mockPrisma.ticket.create.mockResolvedValue({
        id: 't1', userId: 'user-1', subject: 'Помогите', body: 'Детали',
        status: TicketStatus.OPEN,
      });

      const result = await service.create({ subject: 'Помогите', body: 'Детали' } as any, 'user-1');

      expect(result.id).toBe('t1');
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 'user-1', subject: 'Помогите', body: 'Детали' },
        }),
      );
    });
  });

  // ── listMy ────────────────────────────────────────────────────────────────────
  describe('listMy', () => {
    it('should return only tickets for the given user', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([{ id: 't1', userId: 'user-1' }]);
      mockPrisma.ticket.count.mockResolvedValue(1);

      const result = await service.listMy('user-1', 20, 0);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('should throw NotFoundException for non-existent ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.getById('nonexistent', 'user-1', Role.USER)).rejects.toThrow(NotFoundException);
    });

    it('should return ticket when user is the owner', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', userId: 'user-1' });

      const result = await service.getById('t1', 'user-1', Role.USER);
      expect(result.id).toBe('t1');
    });

    it('should return ticket when user is ADMIN (even if not owner)', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', userId: 'other-user' });

      const result = await service.getById('t1', 'admin-user', Role.ADMIN);
      expect(result.id).toBe('t1');
    });

    it('should return ticket when user is MODERATOR (even if not owner)', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', userId: 'other-user' });

      const result = await service.getById('t1', 'mod-user', Role.MODERATOR);
      expect(result.id).toBe('t1');
    });

    it('should throw ForbiddenException when regular USER tries to access another user ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', userId: 'other-user' });

      await expect(service.getById('t1', 'user-1', Role.USER)).rejects.toThrow(ForbiddenException);
    });
  });

  // ── listAll ───────────────────────────────────────────────────────────────────
  describe('listAll', () => {
    it('should return all tickets with pagination', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([
        { id: 't1' }, { id: 't2' }, { id: 't3' },
      ]);
      mockPrisma.ticket.count.mockResolvedValue(3);

      const result = await service.listAll(20, 0);

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
    });
  });

  // ── updateStatus ──────────────────────────────────────────────────────────────
  describe('updateStatus', () => {
    it('should throw NotFoundException for non-existent ticket', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('nonexistent', TicketStatus.IN_PROGRESS)).rejects.toThrow(NotFoundException);
    });

    it('should update ticket status', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 't1', status: TicketStatus.OPEN });
      mockPrisma.ticket.update.mockResolvedValue({ id: 't1', status: TicketStatus.RESOLVED });

      const result = await service.updateStatus('t1', TicketStatus.RESOLVED);

      expect(result.status).toBe(TicketStatus.RESOLVED);
      expect(mockPrisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: TicketStatus.RESOLVED } }),
      );
    });
  });
});
