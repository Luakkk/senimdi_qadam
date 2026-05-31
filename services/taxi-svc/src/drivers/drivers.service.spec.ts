import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from './drivers.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

const mockPrisma = {
  driver: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    findFirst:  jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
  booking:      { findFirst: jest.fn() },
  driverReview: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    aggregate:  jest.fn(),
  },
};

describe('DriversService', () => {
  let service: DriversService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DriversService>(DriversService);
  });

  describe('findAll', () => {
    it('should return drivers ordered by rating', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([{ id: 'd1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { ratingAvg: 'desc' } }),
      );
    });

    it('should filter by status when provided', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);
      await service.findAll('ACTIVE' as any);
      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'ACTIVE' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if driver missing', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });

    it('should build a whatsappLink from the number', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        id: 'd1', whatsapp: '+7 (701) 234-56-78', reviews: [],
      });
      const result = await service.findOne('d1');
      expect(result.whatsappLink).toBe('https://wa.me/77012345678');
    });

    it('should set whatsappLink null when no whatsapp', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ id: 'd1', whatsapp: null, reviews: [] });
      const result = await service.findOne('d1');
      expect(result.whatsappLink).toBeNull();
    });
  });

  describe('create', () => {
    it('should throw ConflictException for duplicate phone', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1' });
      await expect(service.create({ phone: '+7700' } as any)).rejects.toThrow(ConflictException);
    });

    it('should create a new driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);
      mockPrisma.driver.create.mockResolvedValue({ id: 'd1' });
      const result = await service.create({ phone: '+7700' } as any);
      expect(result.id).toBe('d1');
    });
  });

  describe('setStatus', () => {
    it('should throw NotFoundException if driver missing', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.setStatus('nope', 'ACTIVE' as any)).rejects.toThrow(NotFoundException);
    });

    it('should update the status', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ id: 'd1' });
      mockPrisma.driver.update.mockResolvedValue({ id: 'd1', status: 'INACTIVE' });
      const result = await service.setStatus('d1', 'INACTIVE' as any);
      expect(result.status).toBe('INACTIVE');
    });
  });

  describe('addReview', () => {
    it('should throw BadRequestException if no completed booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      await expect(service.addReview('u1', 'b1', { rating: 5 } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if booking has no driver', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', driverId: null });
      await expect(service.addReview('u1', 'b1', { rating: 5 } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if review already exists', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', driverId: 'd1' });
      mockPrisma.driverReview.findUnique.mockResolvedValue({ id: 'r1' });
      await expect(service.addReview('u1', 'b1', { rating: 5 } as any)).rejects.toThrow(ConflictException);
    });

    it('should create review and recalculate driver rating', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', driverId: 'd1' });
      mockPrisma.driverReview.findUnique.mockResolvedValue(null);
      mockPrisma.driverReview.create.mockResolvedValue({ id: 'r1', rating: 5 });
      mockPrisma.driverReview.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 2 } });
      mockPrisma.driver.update.mockResolvedValue({ id: 'd1' });

      const result = await service.addReview('u1', 'b1', { rating: 5 } as any);

      expect(result.id).toBe('r1');
      expect(mockPrisma.driver.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { ratingAvg: 4.5, ratingCount: 2 } }),
      );
    });
  });
});
