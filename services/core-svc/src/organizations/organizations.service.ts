import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListOrganizationsQuery } from './dto/list-organizations.query';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListOrganizationsQuery) {
    const limit = Math.min(query.limit ?? 20, 50);
    const offset = query.offset ?? 0;

    const where: any = {};

    if (query.type) where.type = query.type;
    if (query.district) where.district = query.district;

    if (query.verified === 'true') where.status = 'VERIFIED';
    if (query.verified === 'false') where.status = { not: 'VERIFIED' };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  async getById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }
}