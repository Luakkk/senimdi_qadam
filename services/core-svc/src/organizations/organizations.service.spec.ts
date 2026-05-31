import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { OrgStatus } from '@prisma/client';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  organization: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    findFirst:  jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    count:      jest.fn(),
  },
  savedOrganization: {
    create:     jest.fn(),
    delete:     jest.fn(),
    deleteMany: jest.fn(),
    upsert:     jest.fn(),
    findMany:   jest.fn(),
    count:      jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
  orgService: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
  orgReview: {
    count:     jest.fn(),
    aggregate: jest.fn(),
  },
};

const mockRedis = {
  get:    jest.fn().mockResolvedValue(null),
  set:    jest.fn().mockResolvedValue(undefined),
  del:    jest.fn().mockResolvedValue(undefined),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('OrganizationsService', () => {
  let service: OrganizationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService,  useValue: mockRedis },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  // ── list ─────────────────────────────────────────────────────────────────────
  describe('list', () => {
    it('should return organizations from DB when cache is empty', async () => {
      const orgs = [
        { id: 'org-1', nameRu: 'Больница', status: 'VERIFIED' },
        { id: 'org-2', nameRu: 'Клиника',  status: 'VERIFIED' },
      ];
      mockPrisma.organization.findMany.mockResolvedValue(orgs);
      mockPrisma.organization.count.mockResolvedValue(2);

      const result = await service.list({ limit: 10, offset: 0 } as any);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrisma.organization.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return cached result when Redis has data', async () => {
      const cached = { items: [{ id: 'org-cached' }], total: 1 };
      mockRedis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.list({ limit: 10, offset: 0 } as any);

      expect(result).toEqual(cached);
      // DB не должна вызываться — берём из кэша
      expect(mockPrisma.organization.findMany).not.toHaveBeenCalled();
    });

    it('should skip cache when search query is provided', async () => {
      // При поиске (q.q) кэш не используем — результаты слишком разнообразны
      mockPrisma.organization.findMany.mockResolvedValue([]);
      mockPrisma.organization.count.mockResolvedValue(0);

      await service.list({ q: 'реабилитация', limit: 10, offset: 0 } as any);

      // Redis.get не должен вызываться для поискового запроса
      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(mockPrisma.organization.findMany).toHaveBeenCalledTimes(1);
    });
  });

  // ── getById ──────────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('should return organization by id', async () => {
      const org = { id: 'org-1', nameRu: 'Больница', status: 'VERIFIED' };
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.organization.findUnique.mockResolvedValue(org);

      const result = await service.getById('org-1');
      expect(result.id).toBe('org-1');
    });

    it('should return null for non-existent organization', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      const result = await service.getById('non-existent');
      expect(result).toBeNull();
    });
  });

  // ── nearby ────────────────────────────────────────────────────────────────────
  describe('nearby', () => {
    it('should return orgs within radius sorted by distance', async () => {
      // Организации в разном расстоянии от точки (43.238, 76.945) — Алматы
      mockPrisma.organization.findMany.mockResolvedValue([
        { id: 'far-org',   lat: 43.338, lon: 76.945 }, // ~11км — дальше радиуса
        { id: 'close-org', lat: 43.240, lon: 76.947 }, // ~250м — в радиусе
      ]);

      const result = await service.nearby({ lat: 43.238, lon: 76.945, radius: 5000 });

      // far-org (11км) должна быть отфильтрована
      expect(result.some((o: any) => o.id === 'far-org')).toBe(false);
      // close-org (250м) должна быть в результате
      expect(result.some((o: any) => o.id === 'close-org')).toBe(true);
    });

    it('should attach distanceMeters to each result', async () => {
      mockPrisma.organization.findMany.mockResolvedValue([
        { id: 'org-1', lat: 43.239, lon: 76.946 },
      ]);

      const result = await service.nearby({ lat: 43.238, lon: 76.945, radius: 5000 });

      expect(result[0]).toHaveProperty('distanceMeters');
      expect(typeof result[0].distanceMeters).toBe('number');
    });

    it('should return empty array when no orgs in radius', async () => {
      mockPrisma.organization.findMany.mockResolvedValue([]);

      const result = await service.nearby({ lat: 43.238, lon: 76.945, radius: 1000 });
      expect(result).toHaveLength(0);
    });
  });

  // ── register ──────────────────────────────────────────────────────────────────
  describe('register (self-service)', () => {
    it('should throw ConflictException if user already has an organization', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'existing-org' });

      await expect(
        service.register('user-1', { nameRu: 'Новая Клиника' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create org with PENDING status and upgrade user role', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue(null);
      mockPrisma.organization.create.mockResolvedValue({
        id:     'new-org',
        nameRu: 'Новая Клиника',
        status: OrgStatus.PENDING,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.register('user-1', { nameRu: 'Новая Клиника' } as any);

      expect(result.status).toBe(OrgStatus.PENDING);
      expect(result.organizationId).toBe('new-org');
      // Роль должна быть повышена до ORG_MANAGER
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: 'ORG_MANAGER' } }),
      );
    });
  });

  // ── saveOrg / unsaveOrg ───────────────────────────────────────────────────────
  describe('saveOrg / unsaveOrg', () => {
    it('should save organization for user', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-1' });
      mockPrisma.savedOrganization.upsert.mockResolvedValue({ userId: 'u1', organizationId: 'org-1' });

      const result = await service.saveOrg('u1', 'org-1');
      expect(result.saved).toBe(true);
      expect(mockPrisma.savedOrganization.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: { userId: 'u1', organizationId: 'org-1' } }),
      );
    });

    it('should unsave organization for user', async () => {
      mockPrisma.savedOrganization.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.unsaveOrg('u1', 'org-1');
      expect(result.saved).toBe(false);
      expect(mockPrisma.savedOrganization.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1', organizationId: 'org-1' } }),
      );
    });
  });

  // ── getMine ───────────────────────────────────────────────────────────────────
  describe('getMine', () => {
    it('should throw NotFoundException when manager has no organization', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue(null);

      await expect(service.getMine('manager-1')).rejects.toThrow(NotFoundException);
    });

    it('should return managed organization', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1', managerId: 'manager-1' });

      const result = await service.getMine('manager-1');
      expect(result.id).toBe('org-1');
    });
  });

  // ── ORG_MANAGER services ──────────────────────────────────────────────────────
  describe('createMyService / deleteMyService', () => {
    it('should create a service for managed org', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1', managerId: 'mgr-1' });
      mockPrisma.orgService.create.mockResolvedValue({ id: 'svc-1', nameRu: 'Консультация' });

      const result = await service.createMyService('mgr-1', { nameRu: 'Консультация', price: 5000 } as any);
      expect(result.id).toBe('svc-1');
    });

    it('should throw ForbiddenException when deleting service of another org', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1', managerId: 'mgr-1' });
      mockPrisma.orgService.findUnique.mockResolvedValue({ id: 'svc-1', organizationId: 'other-org' });

      await expect(service.deleteMyService('mgr-1', 'svc-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when service not found', async () => {
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-1', managerId: 'mgr-1' });
      mockPrisma.orgService.findUnique.mockResolvedValue(null);

      await expect(service.deleteMyService('mgr-1', 'svc-nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
