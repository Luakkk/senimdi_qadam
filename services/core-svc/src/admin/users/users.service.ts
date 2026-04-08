import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    q?: string;
    role?: Role;
    isActive?: boolean;
    limit: number;
    offset: number;
  }) {
    const where: any = {};
    if (params.role !== undefined)     where.role     = params.role;
    if (params.isActive !== undefined) where.isActive = params.isActive;
    if (params.q) {
      where.email = { contains: params.q, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit,
        skip: params.offset,
        select: {
          id: true, email: true, role: true,
          isVerified: true, isActive: true,
          createdAt: true,
          profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { tickets: true, complaints: true } },
        },
      }),
    ]);

    return { total, limit: params.limit, offset: params.offset, items };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, role: true,
        isVerified: true, isActive: true, createdAt: true,
        profile: true,
        _count: { select: { tickets: true, complaints: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRole(id: string, role: Role) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }

  async toggleBan(id: string) {
    const user = await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });
    return updated;
  }
}
