import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from '../fcm/fcm.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  booking: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    findFirst:  jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
  driver: {
    findMany:   jest.fn().mockResolvedValue([]),
  },
};

const mockFcm = {
  send:           jest.fn().mockResolvedValue(undefined),
  sendMulticast:  jest.fn().mockResolvedValue(undefined),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FcmService,    useValue: mockFcm },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  // ── create ──────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a booking with PENDING status', async () => {
      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-1', userId: 'user-1', status: 'PENDING',
        fromAddress: 'A', toAddress: 'B',
      });

      const result = await service.create('user-1', {
        fromAddress: 'A', toAddress: 'B',
        fromLat: 43.0, fromLon: 76.0,
        toLat: 43.1, toLon: 76.1,
        scheduledAt: new Date().toISOString(),
      } as any);

      expect(result.status).toBe('PENDING');
      expect(mockPrisma.booking.create).toHaveBeenCalledTimes(1);
      // Должен уведомить активных водителей
      expect(mockPrisma.driver.findMany).toHaveBeenCalledTimes(1);
    });
  });

  // ── getMyBookings ───────────────────────────────────────────────────────────
  describe('getMyBookings', () => {
    it('should return a cursor page of bookings for the given user', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([
        { id: 'b1', userId: 'user-1' },
        { id: 'b2', userId: 'user-1' },
      ]);

      const result = await service.getMyBookings('user-1');
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  // ── getOne ──────────────────────────────────────────────────────────────────
  describe('getOne', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      await expect(service.getOne('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if booking belongs to another user (scoped query)', async () => {
      // findFirst фильтрует по { id, userId } — чужая заявка просто не находится
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      await expect(service.getOne('user-1', 'b1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.booking.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'b1', userId: 'user-1' } }),
      );
    });

    it('should return booking if it belongs to the user', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', userId: 'user-1', driver: null, messages: [] });
      const result = await service.getOne('user-1', 'b1');
      expect(result.id).toBe('b1');
    });
  });

  // ── cancel ──────────────────────────────────────────────────────────────────
  describe('cancel', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      await expect(service.cancel('user-1', 'b1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for a COMPLETED booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b1', userId: 'user-1', status: 'COMPLETED',
      });
      await expect(service.cancel('user-1', 'b1')).rejects.toThrow(ForbiddenException);
    });

    it('should cancel a PENDING booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', userId: 'user-1', status: 'PENDING' });
      mockPrisma.booking.update.mockResolvedValue({ id: 'b1', status: 'CANCELLED' });
      const result = await service.cancel('user-1', 'b1', 'передумал');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
