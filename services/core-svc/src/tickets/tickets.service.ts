import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTicketDto, meta: { userId?: string; role?: string }) {
    return this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        organizationId: dto.organizationId ?? null,
        contact: dto.contact ?? null,
        userId: meta.userId ?? null,
        role: meta.role ?? null,
      },
    });
  }

  listAll() {
    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  setStatus(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'DONE') {
    return this.prisma.ticket.update({
      where: { id },
      data: { status },
    });
  }
}