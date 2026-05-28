import { Injectable, NotFoundException } from '@nestjs/common';
import { OrgCategory, OrgStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { VerifyOrganizationDto } from './dto/verify-organization.dto';

@Injectable()
export class AdminOrganizationsService {
  private readonly resend: Resend;

  constructor(
    private readonly prisma:  PrismaService,
    private readonly config:  ConfigService,
    private readonly audit:   AuditService,
  ) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
  }

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
  async verify(id: string, dto: VerifyOrganizationDto, actorId?: string, ip?: string) {
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
          status:     dto.statusTo,         // итог = statusTo
          statusFrom: org.status,           // предыдущий статус
          statusTo:   dto.statusTo,         // новый статус
          method:     dto.method ?? null,
          moderatorId: dto.moderatorId ?? null,
          comment: dto.comment ?? null,
        },
      });

      // Send email notification to the manager if email is available
      if (org.managerId) {
        this.notifyManagerStatusChange(org.managerId, org.nameRu, org.status, dto.statusTo, dto.comment).catch(() => {});
      }

      // Audit log
      if (actorId) {
        this.audit.log({
          actorId,
          action:     `ORG_${dto.statusTo}`,
          targetType: 'Organization',
          targetId:   id,
          metadata:   { from: org.status, to: dto.statusTo, comment: dto.comment },
          ip,
        }).catch(() => {});
      }

      return updated;
    });
  }

  // ── EMAIL: notify manager on status change ───────────────────────────────
  private async notifyManagerStatusChange(
    managerId: string,
    orgNameRu: string,
    fromStatus: OrgStatus,
    toStatus: OrgStatus,
    comment?: string | null,
  ) {
    const manager = await this.prisma.user.findUnique({ where: { id: managerId }, select: { email: true } });
    if (!manager?.email) return;

    const isApproved = toStatus === OrgStatus.VERIFIED;
    const isRejected = toStatus === OrgStatus.REJECTED;
    if (!isApproved && !isRejected && toStatus !== OrgStatus.SUSPENDED) return;

    const subject = isApproved
      ? `✅ Ваша организация одобрена — ${orgNameRu}`
      : isRejected
        ? `❌ Заявка отклонена — ${orgNameRu}`
        : `⚠️ Статус организации изменён — ${orgNameRu}`;

    const bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #2563eb;">SenimdiQAdam</h2>
        <p>Здравствуйте,</p>
        <p>Статус вашей организации <strong>${orgNameRu}</strong> был изменён:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; color: #64748b;">Было</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${fromStatus}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0; color: #64748b;">Стало</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: ${isApproved ? '#16a34a' : '#dc2626'};">${toStatus}</td>
          </tr>
          ${comment ? `<tr><td style="padding: 8px; border: 1px solid #e2e8f0; color: #64748b;">Комментарий</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${comment}</td></tr>` : ''}
        </table>
        ${isApproved ? '<p>🎉 Ваша организация теперь видна всем пользователям платформы!</p>' : ''}
        ${isRejected ? '<p>Если у вас есть вопросы, ответьте на это письмо.</p>' : ''}
        <p style="color: #64748b; font-size: 13px;">С уважением, команда SenimdiQAdam</p>
      </div>
    `;

    await this.resend.emails.send({
      from:    this.config.get('EMAIL_FROM') || 'noreply@senimdi-qadam.kz',
      to:      manager.email,
      subject,
      html:    bodyHtml,
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
