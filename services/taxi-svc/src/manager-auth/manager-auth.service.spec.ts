import { Test, TestingModule } from '@nestjs/testing';
import { ManagerAuthService } from './manager-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

const mockPrisma = {
  managerInvite: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
  },
  taxiManager: {
    findUnique: jest.fn(),
    create:     jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('ManagerAuthService', () => {
  let service: ManagerAuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // fetch вызывается при промоте роли — глушим, чтобы не ходить в сеть
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerAuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ManagerAuthService>(ManagerAuthService);
  });

  describe('generateInviteCode', () => {
    it('should create an invite with INVATXI- prefix and an expiry', async () => {
      mockPrisma.managerInvite.create.mockResolvedValue({});
      const result = await service.generateInviteCode(7);
      expect(result.code).toMatch(/^INVATXI-/);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockPrisma.managerInvite.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('listInvites', () => {
    it('should return invites newest first', async () => {
      mockPrisma.managerInvite.findMany.mockResolvedValue([{ code: 'INVATXI-1' }]);
      const result = await service.listInvites();
      expect(result).toHaveLength(1);
    });
  });

  describe('registerWithInvite', () => {
    const dto = { inviteCode: 'INVATXI-1', firstName: 'A', lastName: 'B', phone: '+7700' } as any;

    it('should throw NotFoundException for an unknown invite', async () => {
      mockPrisma.managerInvite.findUnique.mockResolvedValue(null);
      await expect(service.registerWithInvite('u1', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for an already-used invite', async () => {
      mockPrisma.managerInvite.findUnique.mockResolvedValue({ code: 'INVATXI-1', usedBy: 'someone' });
      await expect(service.registerWithInvite('u1', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for an expired invite', async () => {
      mockPrisma.managerInvite.findUnique.mockResolvedValue({
        code: 'INVATXI-1', usedBy: null, expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.registerWithInvite('u1', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if a manager profile already exists', async () => {
      mockPrisma.managerInvite.findUnique.mockResolvedValue({
        code: 'INVATXI-1', usedBy: null, expiresAt: new Date(Date.now() + 100000),
      });
      mockPrisma.taxiManager.findUnique.mockResolvedValue({ id: 'm1' });
      await expect(service.registerWithInvite('u1', dto)).rejects.toThrow(ConflictException);
    });

    it('should create the manager, mark the invite used and promote the role', async () => {
      mockPrisma.managerInvite.findUnique.mockResolvedValue({
        code: 'INVATXI-1', usedBy: null, expiresAt: new Date(Date.now() + 100000),
      });
      mockPrisma.taxiManager.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([{ id: 'm1', userId: 'u1' }, {}]);

      const result = await service.registerWithInvite('u1', dto);

      expect(result.manager.id).toBe('m1');
      expect(result).toHaveProperty('message');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMyProfile', () => {
    it('should throw NotFoundException if no profile', async () => {
      mockPrisma.taxiManager.findUnique.mockResolvedValue(null);
      await expect(service.getMyProfile('u1')).rejects.toThrow(NotFoundException);
    });

    it('should return the manager profile', async () => {
      mockPrisma.taxiManager.findUnique.mockResolvedValue({ id: 'm1', userId: 'u1' });
      const result = await service.getMyProfile('u1');
      expect(result.id).toBe('m1');
    });
  });
});
