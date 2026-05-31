import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update:     jest.fn(),
  },
  userProfile: {
    findUnique: jest.fn(),
    upsert:     jest.fn(),
  },
  relativeLink: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  newsLike:  { findMany: jest.fn(), count: jest.fn() },
  guideLike: { findMany: jest.fn(), count: jest.fn() },
  deviceToken: { upsert: jest.fn(), deleteMany: jest.fn() },
};

const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService,  useValue: mockRedis },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  // ── getMyProfile ──────────────────────────────────────────────────────────────
  describe('getMyProfile', () => {
    it('should return the user with profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.kz', profile: {} });
      const result = await service.getMyProfile('u1');
      expect(result.id).toBe('u1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMyProfile('nope')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getPublicProfile ────────────────────────────────────────────────────────────
  describe('getPublicProfile', () => {
    it('should return cached data without hitting DB', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ id: 'cached' }));
      const result = await service.getPublicProfile('u1');
      expect(result).toEqual({ id: 'cached' });
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getPublicProfile('nope')).rejects.toThrow(NotFoundException);
    });

    it('should expose disabilityType for USER role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', role: Role.USER, news: [],
        profile: { firstName: 'A', disabilityType: 'VISION' },
      });
      const result = await service.getPublicProfile('u1');
      expect(result.disabilityType).toBe('VISION');
    });

    it('should hide disabilityType for non-USER roles', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', role: Role.ORG_MANAGER, news: [],
        profile: { firstName: 'A', disabilityType: 'VISION' },
      });
      const result = await service.getPublicProfile('u1');
      expect(result.disabilityType).toBeNull();
    });
  });

  // ── updateProfile ───────────────────────────────────────────────────────────────
  describe('updateProfile', () => {
    it('should strip disability fields for RELATIVE role', async () => {
      mockPrisma.userProfile.upsert.mockResolvedValue({ userId: 'u1' });
      await service.updateProfile(
        'u1',
        { firstName: 'A', disabilityType: 'VISION', disabilityNote: 'x' } as any,
        Role.RELATIVE,
      );
      const callArgs = mockPrisma.userProfile.upsert.mock.calls[0][0];
      expect(callArgs.update.disabilityType).toBeUndefined();
      expect(callArgs.update.disabilityNote).toBeUndefined();
    });

    it('should keep disability fields for USER role', async () => {
      mockPrisma.userProfile.upsert.mockResolvedValue({ userId: 'u1' });
      await service.updateProfile('u1', { disabilityType: 'VISION' } as any, Role.USER);
      const callArgs = mockPrisma.userProfile.upsert.mock.calls[0][0];
      expect(callArgs.update.disabilityType).toBe('VISION');
    });

    it('should invalidate public cache after update', async () => {
      mockPrisma.userProfile.upsert.mockResolvedValue({ userId: 'u1' });
      await service.updateProfile('u1', { firstName: 'A' } as any, Role.USER);
      expect(mockRedis.del).toHaveBeenCalledWith('public_profile:u1');
    });
  });

  // ── requestLink ─────────────────────────────────────────────────────────────────
  describe('requestLink', () => {
    it('should throw ForbiddenException if requester is not RELATIVE', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'g1', role: Role.USER });
      await expect(
        service.requestLink('g1', { dependentEmail: 'd@d.kz' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if dependent email not found', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'g1', role: Role.RELATIVE }) // guardian
        .mockResolvedValueOnce(null);                              // dependent
      await expect(
        service.requestLink('g1', { dependentEmail: 'missing@d.kz' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when linking to self', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'g1', role: Role.RELATIVE })
        .mockResolvedValueOnce({ id: 'g1' });
      await expect(
        service.requestLink('g1', { dependentEmail: 'self@d.kz' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if link already exists', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'g1', role: Role.RELATIVE })
        .mockResolvedValueOnce({ id: 'd1' });
      mockPrisma.relativeLink.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.requestLink('g1', { dependentEmail: 'd@d.kz' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create an unaccepted link on success', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce({ id: 'g1', role: Role.RELATIVE })
        .mockResolvedValueOnce({ id: 'd1' });
      mockPrisma.relativeLink.findUnique.mockResolvedValue(null);
      mockPrisma.relativeLink.create.mockResolvedValue({ id: 'link1', isAccepted: false });

      const result = await service.requestLink('g1', { dependentEmail: 'd@d.kz', label: 'Сын' } as any);
      expect(result.isAccepted).toBe(false);
      expect(mockPrisma.relativeLink.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ guardianId: 'g1', dependentId: 'd1', isAccepted: false }),
        }),
      );
    });
  });

  // ── acceptLink ──────────────────────────────────────────────────────────────────
  describe('acceptLink', () => {
    it('should throw NotFoundException for missing link', async () => {
      mockPrisma.relativeLink.findUnique.mockResolvedValue(null);
      await expect(service.acceptLink('u1', 'nope')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the dependent', async () => {
      mockPrisma.relativeLink.findUnique.mockResolvedValue({ id: 'l1', dependentId: 'other' });
      await expect(service.acceptLink('u1', 'l1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already accepted', async () => {
      mockPrisma.relativeLink.findUnique.mockResolvedValue({ id: 'l1', dependentId: 'u1', isAccepted: true });
      await expect(service.acceptLink('u1', 'l1')).rejects.toThrow(BadRequestException);
    });

    it('should accept the link on success', async () => {
      mockPrisma.relativeLink.findUnique.mockResolvedValue({ id: 'l1', dependentId: 'u1', isAccepted: false });
      mockPrisma.relativeLink.update.mockResolvedValue({ id: 'l1', isAccepted: true });
      const result = await service.acceptLink('u1', 'l1');
      expect(result.isAccepted).toBe(true);
    });
  });

  // ── removeLink ──────────────────────────────────────────────────────────────────
  describe('removeLink', () => {
    it('should throw ForbiddenException if user is neither guardian nor dependent', async () => {
      mockPrisma.relativeLink.findUnique.mockResolvedValue({ id: 'l1', guardianId: 'a', dependentId: 'b' });
      await expect(service.removeLink('stranger', 'l1')).rejects.toThrow(ForbiddenException);
    });

    it('should delete the link for a participant', async () => {
      mockPrisma.relativeLink.findUnique.mockResolvedValue({ id: 'l1', guardianId: 'u1', dependentId: 'b' });
      mockPrisma.relativeLink.delete.mockResolvedValue({});
      const result = await service.removeLink('u1', 'l1');
      expect(result).toHaveProperty('message');
      expect(mockPrisma.relativeLink.delete).toHaveBeenCalledWith({ where: { id: 'l1' } });
    });
  });

  // ── device tokens ───────────────────────────────────────────────────────────────
  describe('device tokens', () => {
    it('should upsert a device token on register', async () => {
      mockPrisma.deviceToken.upsert.mockResolvedValue({});
      const result = await service.registerDevice('u1', 'tok', 'android');
      expect(result).toEqual({ registered: true });
    });

    it('should delete device tokens on unregister', async () => {
      mockPrisma.deviceToken.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.unregisterDevice('u1', 'tok');
      expect(result).toEqual({ unregistered: true });
    });
  });

  // ── deactivate ──────────────────────────────────────────────────────────────────
  describe('deactivate', () => {
    it('should set isActive=false and invalidate cache', async () => {
      mockPrisma.user.update.mockResolvedValue({});
      const result = await service.deactivate('u1');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { isActive: false } }),
      );
      expect(mockRedis.del).toHaveBeenCalledWith('public_profile:u1');
      expect(result).toHaveProperty('message');
    });
  });
});
