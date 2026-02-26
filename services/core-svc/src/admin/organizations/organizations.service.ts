import { Injectable, NotFoundException } from '@nestjs/common';
import { OrgStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { VerifyOrganizationDto } from './dto/verify-organization.dto';

@Injectable()
export class AdminOrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const exists = await this.prisma.organization.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Organization not found');

    return this.prisma.organization.update({
      where: { id },
      data: dto as any,
    });
  }

  async verify(id: string, dto: VerifyOrganizationDto) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');

    const statusTo = dto.statusTo;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.organization.update({
        where: { id },
        data: {
          status: statusTo,
          verifiedAt: statusTo === OrgStatus.VERIFIED ? new Date() : null,
          verifiedBy: statusTo === OrgStatus.VERIFIED ? dto.moderatorId ?? null : null,
        } as any,
      });

      await tx.verificationLog.create({
        data: {
          organizationId: id,
          statusFrom: org.status,
          statusTo,
          method: dto.method,
          moderatorId: dto.moderatorId ?? null,
          comment: dto.comment ?? null,
        } as any,
      });

      return updated;
    });
  }

  logs(organizationId?: string) {
    return this.prisma.verificationLog.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}