import { Injectable, NotFoundException } from '@nestjs/common';
import { OrgCategory, OrgStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { VerifyOrganizationDto } from './dto/verify-organization.dto';

@Injectable()
export class AdminOrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── LIST ────────────────────────────────────────────────────────────────
  async findAll(params: {
    status?: OrgStatus;
    category?: OrgCategory;
    q?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {};
    if (params.status)   where.status   = params.status;
    if (params.category) where.category = params.category;
    if (params.q) {
      where.OR = [
        { nameRu: { contains: params.q, mode: 'insensitive' } },
        { nameKk: { contains: params.q, mode: 'insensitive' } },
        { address: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit,
        skip: params.offset,
        include: { _count: { select: { reviews: true, savedBy: true } } },
      }),
    ]);

    return { total, limit: params.limit, offset: params.offset, items };
  }

  // ── ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
        verificationLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { reviews: true, savedBy: true } },
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  // ── CREATE ──────────────────────────────────────────────────────────────
  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        nameRu: dto.nameRu,
        nameKk: dto.nameKk,
        nameEn: dto.nameEn,
        category: dto.category,
        description: dto.description,
        address: dto.address,
        city: dto.city ?? 'Алматы',
        phone: dto.phone,
        email: dto.email,
        website: dto.website,
        instagram: dto.instagram,
        workingHours: dto.workingHours,
        isAccessible: dto.isAccessible ?? true,
        lat: dto.lat,
        lon: dto.lon,
      },
    });
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: dto as any,
    });
  }

  // ── VERIFY ──────────────────────────────────────────────────────────────
  async verify(id: string, dto: VerifyOrganizationDto) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.organization.update({
        where: { id },
        data: { status: dto.statusTo },
      });

      await tx.verificationLog.create({
        data: {
          organizationId: id,
          statusFrom: org.status,
          statusTo: dto.statusTo,
          method: dto.method,
          moderatorId: dto.moderatorId ?? null,
          comment: dto.comment ?? null,
        } as any,
      });

      return updated;
    });
  }

  // ── DELETE ──────────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.organization.delete({ where: { id } });
    return { message: 'Organization deleted' };
  }

  // ── LOGS ─────────────────────────────────────────────────────────────────
  logs(organizationId: string) {
    return this.prisma.verificationLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
