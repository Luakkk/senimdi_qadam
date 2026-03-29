import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ComplaintStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Создать жалобу ────────────────────────────────────────────────────────
  async create(dto: CreateComplaintDto, userId: string) {
    return this.prisma.complaint.create({
      data: {
        userId,
        targetType:  dto.targetType,
        targetId:    dto.targetId,
        reason:      dto.reason,
        description: dto.description ?? null,
      },
    });
  }

  // ── Мои жалобы ────────────────────────────────────────────────────────────
  async listMy(userId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.complaint.count({ where: { userId } }),
    ]);
    return { items, total };
  }

  // ── Одна жалоба (автор или ADMIN/MODERATOR) ───────────────────────────────
  async getById(id: string, userId: string, role: Role) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Жалоба не найдена');

    if (complaint.userId !== userId && role !== Role.ADMIN && role !== Role.MODERATOR) {
      throw new ForbiddenException('Нет доступа');
    }
    return complaint;
  }

  // ── Все жалобы (ADMIN/MODERATOR) ─────────────────────────────────────────
  async listAll(status?: ComplaintStatus, limit = 20, offset = 0) {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.complaint.count({ where }),
    ]);
    return { items, total };
  }

  // ── Обновить статус (ADMIN/MODERATOR) ────────────────────────────────────
  async updateStatus(id: string, status: ComplaintStatus) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Жалоба не найдена');
    return this.prisma.complaint.update({ where: { id }, data: { status } });
  }
}
