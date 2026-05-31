import { Test, TestingModule } from '@nestjs/testing';
import { AdminOrganizationsService } from './organizations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';
import { OrgStatus } from '@prisma/client';

const mockPrisma = {
  organization: {
    count:      jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  verificationLog: { create: jest.fn(), findMany: jest.fn() },
  user: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};

const mockConfig = {
  get: jest.fn((k: string) => (k === 'RESEND_API_KEY' ? 're_test' : 'noreply@test.kz')),
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

describe('AdminOrganizationsService', () => {
  let service: AdminOrganizationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminOrganizationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: AuditService,  useValue: mockAudit },
      ],
    }).compile();
    service = module.get<AdminOrganizationsService>(AdminOrganizationsService);
  });

  describe('findAll', () => {
    it('should return paginated organizations', async () => {
      mockPrisma.organization.count.mockResolvedValue(1);
      mockPrisma.organization.findMany.mockResolvedValue([{ id: 'o1' }]);
      const result = await service.findAll({ limit: 20, offset: 0 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should build an OR search filter from query', async () => {
      mockPrisma.organization.count.mockResolvedValue(0);
      mockPrisma.organization.findMany.mockResolvedValue([]);
      await service.findAll({ q: 'клиника', limit: 20, offset: 0 });
      const callArgs = mockPrisma.organization.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
      expect(callArgs.where.OR.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing org', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });

    it('should return the organization', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'o1' });
      const result = await service.findOne('o1');
      expect(result.id).toBe('o1');
    });
  });

  describe('create', () => {
    it('should default city to Алматы when omitted', async () => {
      mockPrisma.organization.create.mockResolvedValue({ id: 'o1' });
      await service.create({ nameRu: 'Тест', category: 'CLINIC' } as any);
      const callArgs = mockPrisma.organization.create.mock.calls[0][0];
      expect(callArgs.data.city).toBe('Алматы');
    });
  });

  describe('update', () => {
    it('should verify existence then update', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'o1' });
      mockPrisma.organization.update.mockResolvedValue({ id: 'o1', nameRu: 'Новое' });
      const result = await service.update('o1', { nameRu: 'Новое' } as any);
      expect(result.nameRu).toBe('Новое');
    });
  });

  describe('verify', () => {
    it('should throw NotFoundException for missing org', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      await expect(service.verify('nope', { statusTo: OrgStatus.VERIFIED } as any)).rejects.toThrow(NotFoundException);
    });

    it('should update status and write a verification log in a transaction', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'o1', status: OrgStatus.PENDING, nameRu: 'Тест', managerId: null,
      });
      const tx = {
        organization:    { update: jest.fn().mockResolvedValue({ id: 'o1', status: OrgStatus.VERIFIED }) },
        verificationLog: { create: jest.fn().mockResolvedValue({}) },
      };
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

      const result = await service.verify('o1', { statusTo: OrgStatus.VERIFIED } as any, 'admin-1');

      expect(result.status).toBe(OrgStatus.VERIFIED);
      expect(tx.organization.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'o1' }, data: { status: OrgStatus.VERIFIED } }),
      );
      expect(tx.verificationLog.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for missing org', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });

    it('should delete existing org', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'o1' });
      mockPrisma.organization.delete.mockResolvedValue({});
      const result = await service.remove('o1');
      expect(result).toHaveProperty('message');
    });
  });
});
