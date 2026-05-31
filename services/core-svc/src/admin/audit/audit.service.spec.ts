import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  auditLog: {
    create:   jest.fn(),
    findMany: jest.fn(),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AuditService>(AuditService);
  });

  describe('log', () => {
    it('should create an audit record', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({});
      await service.log({ actorId: 'a1', action: 'BAN', targetType: 'User', targetId: 'u1' });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ actorId: 'a1', action: 'BAN', targetType: 'User', targetId: 'u1' }),
        }),
      );
    });

    it('should swallow DB errors (audit must not break main flow)', async () => {
      mockPrisma.auditLog.create.mockRejectedValue(new Error('db down'));
      await expect(
        service.log({ actorId: 'a1', action: 'X', targetType: 'Y', targetId: 'z' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('getLogs', () => {
    it('should apply actor/target/action filters', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      await service.getLogs({ actorId: 'a1', targetType: 'User', action: 'BAN' });
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { actorId: 'a1', targetType: 'User', action: 'BAN' },
        }),
      );
    });

    it('should return items and a nextCursor field', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([{ id: 'l1' }]);
      const result = await service.getLogs({ limit: 50 });
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('nextCursor');
    });
  });
});
