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
    update:     jest.fn(),
    count:      jest.fn(),
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
      } as any);

      expect(result.status).toBe('PENDING');
      expect(mockPrisma.booking.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── getMyBookings ───────────────────────────────────────────────────────────
  describe('getMyBookings', () => {
    it('should return bookings for the given user', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([
        { id: 'b1', userId: 'user-1' },
        { id: 'b2', userId: 'user-1' },
      ]);

      const result = await service.getMyBookings('user-1');
      expect(result).toHaveLength(2);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  // ── getOne ──────────────────────────────────────────────────────────────────
  describe('getOne', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.getOne('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if booking belongs to another user', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'other-user' });
      await expect(service.getOne('user-1', 'b1')).rejects.toThrow(ForbiddenException);
    });

    it('should return booking if it belongs to the user', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'user-1', driver: null, messages: [] });
      const result = await service.getOne('user-1', 'b1');
      expect(result.id).toBe('b1');
    });
  });

  // ── cancel ──────────────────────────────────────────────────────────────────
  describe('cancel', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.cancel('user-1', 'b1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if booking is not PENDING or CONFIRMED', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 'b1', userId: 'user-1', status: 'COMPLETED',
      });
      await expect(service.cancel('user-1', 'b1')).rejects.toThrow(ForbiddenException);
    });
  });
});
