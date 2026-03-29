import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TicketStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Создать обращение ─────────────────────────────────────────────────────
  async create(dto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: { userId, subject: dto.subject, body: dto.body },
    });
  }

  // ── Мои обращения ─────────────────────────────────────────────────────────
  async listMy(userId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.ticket.count({ where: { userId } }),
    ]);
    return { items, total };
  }

  // ── Одно обращение (автор или ADMIN/MODERATOR) ────────────────────────────
  async getById(id: string, userId: string, role: Role) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Обращение не найдено');

    if (ticket.userId !== userId && role !== Role.ADMIN && role !== Role.MODERATOR) {
      throw new ForbiddenException('Нет доступа');
    }
    return ticket;
  }

  // ── Все обращения (ADMIN/MODERATOR) ──────────────────────────────────────
  async listAll(limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.ticket.count(),
    ]);
    return { items, total };
  }

  // ── Обновить статус (ADMIN/MODERATOR) ────────────────────────────────────
  async updateStatus(id: string, status: TicketStatus) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Обращение не найдено');
    return this.prisma.ticket.update({ where: { id }, data: { status } });
  }
}
