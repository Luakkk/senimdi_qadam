import { Test, TestingModule } from '@nestjs/testing';
import { RecurringService } from './recurring.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  recurringBooking: {
    create:    jest.fn(),
    findMany:  jest.fn(),
    findFirst: jest.fn(),
    update:    jest.fn(),
    delete:    jest.fn(),
  },
  booking: { create: jest.fn() },
};

const mockRedis = {
  setNX: jest.fn(),
  del:   jest.fn().mockResolvedValue(undefined),
};

describe('RecurringService', () => {
  let service: RecurringService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService,  useValue: mockRedis },
      ],
    }).compile();
    service = module.get<RecurringService>(RecurringService);
  });

  describe('create', () => {
    it('should throw BadRequestException for an invalid cron', async () => {
      await expect(
        service.create('u1', { cronExpression: 'not-a-cron' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a template and compute nextRunAt for a valid cron', async () => {
      mockPrisma.recurringBooking.create.mockResolvedValue({ id: 'r1', cronExpression: '0 9 * * 1-5' });
      const result = await service.create('u1', {
        fromAddress: 'A', toAddress: 'B',
        disabilityType: 'VISUAL', cronExpression: '0 9 * * 1-5',
      } as any);
      expect(result.id).toBe('r1');
      const callArgs = mockPrisma.recurringBooking.create.mock.calls[0][0];
      expect(callArgs.data.nextRunAt).toBeInstanceOf(Date);
      expect(callArgs.data.isActive).toBe(true);
    });
  });

  describe('getMyRecurring', () => {
    it('should list the user templates', async () => {
      mockPrisma.recurringBooking.findMany.mockResolvedValue([{ id: 'r1' }]);
      const result = await service.getMyRecurring('u1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.recurringBooking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
    });
  });

  describe('toggleActive', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.recurringBooking.findFirst.mockResolvedValue(null);
      await expect(service.toggleActive('u1', 'r1', false)).rejects.toThrow(NotFoundException);
    });

    it('should clear nextRunAt when paused', async () => {
      mockPrisma.recurringBooking.findFirst.mockResolvedValue({ id: 'r1', cronExpression: '0 9 * * 1-5' });
      mockPrisma.recurringBooking.update.mockResolvedValue({ id: 'r1', isActive: false });
      await service.toggleActive('u1', 'r1', false);
      const callArgs = mockPrisma.recurringBooking.update.mock.calls[0][0];
      expect(callArgs.data.nextRunAt).toBeNull();
    });

    it('should recompute nextRunAt when resumed', async () => {
      mockPrisma.recurringBooking.findFirst.mockResolvedValue({ id: 'r1', cronExpression: '0 9 * * 1-5' });
      mockPrisma.recurringBooking.update.mockResolvedValue({ id: 'r1', isActive: true });
      await service.toggleActive('u1', 'r1', true);
      const callArgs = mockPrisma.recurringBooking.update.mock.calls[0][0];
      expect(callArgs.data.nextRunAt).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.recurringBooking.findFirst.mockResolvedValue(null);
      await expect(service.remove('u1', 'r1')).rejects.toThrow(NotFoundException);
    });

    it('should delete the template', async () => {
      mockPrisma.recurringBooking.findFirst.mockResolvedValue({ id: 'r1' });
      mockPrisma.recurringBooking.delete.mockResolvedValue({});
      const result = await service.remove('u1', 'r1');
      expect(result).toHaveProperty('message');
    });
  });

  describe('processDueRecurring', () => {
    it('should skip the tick when the distributed lock is held elsewhere', async () => {
      mockRedis.setNX.mockResolvedValue(false);
      await service.processDueRecurring();
      expect(mockPrisma.recurringBooking.findMany).not.toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should process due items and release the lock', async () => {
      mockRedis.setNX.mockResolvedValue(true);
      mockPrisma.recurringBooking.findMany.mockResolvedValue([
        { id: 'r1', userId: 'u1', cronExpression: '0 9 * * 1-5', fromAddress: 'A', toAddress: 'B', disabilityType: 'VISUAL', note: null },
      ]);
      mockPrisma.booking.create.mockResolvedValue({ id: 'b1' });
      mockPrisma.recurringBooking.update.mockResolvedValue({ id: 'r1' });

      await service.processDueRecurring();

      expect(mockPrisma.booking.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.recurringBooking.update).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledTimes(1);
    });
  });
});
