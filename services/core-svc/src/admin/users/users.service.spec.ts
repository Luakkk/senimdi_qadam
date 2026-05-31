import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

const mockPrisma = {
  user: {
    count:      jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    update:     jest.fn(),
  },
};

describe('AdminUsersService', () => {
  let service: AdminUsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AdminUsersService>(AdminUsersService);
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);

      const result = await service.findAll({ limit: 20, offset: 0 });
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should filter by role and search query', async () => {
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.user.findMany.mockResolvedValue([]);

      await service.findAll({ role: Role.ADMIN, q: 'test', limit: 20, offset: 0 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: Role.ADMIN,
            email: { contains: 'test', mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });

    it('should return the user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@a.kz' });
      const result = await service.findOne('u1');
      expect(result.id).toBe('u1');
    });
  });

  describe('updateRole', () => {
    it('should update role after verifying user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', isActive: true });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', role: Role.MODERATOR });

      const result = await service.updateRole('u1', Role.MODERATOR);
      expect(result.role).toBe(Role.MODERATOR);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { role: Role.MODERATOR } }),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.updateRole('nope', Role.ADMIN)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleBan', () => {
    it('should flip isActive from true to false', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', isActive: true });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', isActive: false });

      const result = await service.toggleBan('u1');
      expect(result.isActive).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } }),
      );
    });

    it('should flip isActive from false to true', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', isActive: false });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', isActive: true });

      const result = await service.toggleBan('u1');
      expect(result.isActive).toBe(true);
    });
  });
});
