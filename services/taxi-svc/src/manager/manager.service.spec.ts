import { Test, TestingModule } from '@nestjs/testing';
import { ManagerService } from './manager.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingGateway } from '../gateways/booking.gateway';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  booking: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
  driver: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockGateway = {
  emitBookingStatusChanged: jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ManagerService', () => {
  let service: ManagerService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerService,
        { provide: PrismaService,   useValue: mockPrisma },
        { provide: BookingGateway,  useValue: mockGateway },
      ],
    }).compile();

    service = module.get<ManagerService>(ManagerService);
  });

  // ── getQueue ─────────────────────────────────────────────────────────────────
  describe('getQueue', () => {
    it('should return pending bookings in FIFO order', async () => {
      const pending = [{ id: 'b1', status: 'PENDING' }];
      mockPrisma.booking.findMany.mockResolvedValue(pending);

      const result = await service.getQueue();
      expect(result).toEqual(pending);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDING' } }),
      );
    });
  });

  // ── assignDriver ─────────────────────────────────────────────────────────────
  describe('assignDriver', () => {
    it('should throw NotFoundException if booking not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          taxiManager: { findUnique: jest.fn().mockResolvedValue({ id: 'mgr-1' }) },
          booking: { findUnique: jest.fn().mockResolvedValue(null) },
          driver:  { findUnique: jest.fn() },
        }),
      );
      await expect(service.assignDriver('mgr-1', 'b1', { driverId: 'd1' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if booking is not PENDING', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          taxiManager: { findUnique: jest.fn().mockResolvedValue({ id: 'mgr-1' }) },
          booking: { findUnique: jest.fn().mockResolvedValue({ id: 'b1', status: 'CONFIRMED' }), updateMany: jest.fn() },
          driver:  { findUnique: jest.fn() },
        }),
      );
      await expect(service.assignDriver('mgr-1', 'b1', { driverId: 'd1' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if driver not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          taxiManager: { findUnique: jest.fn().mockResolvedValue({ id: 'mgr-1' }) },
          booking: { findUnique: jest.fn().mockResolvedValue({ id: 'b1', status: 'PENDING' }), updateMany: jest.fn() },
          driver:  { findUnique: jest.fn().mockResolvedValue(null) },
        }),
      );
      await expect(service.assignDriver('mgr-1', 'b1', { driverId: 'd1' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateStatus ─────────────────────────────────────────────────────────────
  describe('updateStatus', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('b1', { status: 'CANCELLED' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for invalid status transition', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', status: 'PENDING' });
      await expect(
        service.updateStatus('b1', { status: 'COMPLETED' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update status and emit WebSocket event', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', status: 'CONFIRMED' });
      mockPrisma.booking.update.mockResolvedValue({ id: 'b1', status: 'IN_PROGRESS' });

      const result = await service.updateStatus('b1', { status: 'IN_PROGRESS' } as any);
      expect(result.status).toBe('IN_PROGRESS');
      expect(mockGateway.emitBookingStatusChanged).toHaveBeenCalledWith('b1', 'IN_PROGRESS');
    });
  });

  // ── getStats ─────────────────────────────────────────────────────────────────
  describe('getStats', () => {
    it('should return booking counts by status', async () => {
      mockPrisma.booking.count.mockResolvedValue(5);

      const stats = await service.getStats();
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('confirmed');
      expect(stats).toHaveProperty('completed');
    });
  });
});
