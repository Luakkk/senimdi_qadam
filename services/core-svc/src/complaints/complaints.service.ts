import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateComplaintDto, meta: { userId?: string; role?: string }) {
    return this.prisma.complaint.create({
      data: {
        message: dto.message,
        organizationId: dto.organizationId ?? null,
        contact: dto.contact ?? null,
        userId: meta.userId ?? null,
        role: meta.role ?? null,
      },
    });
  }

  listAll() {
    return this.prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  setStatus(id: string, status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED') {
    return this.prisma.complaint.update({
      where: { id },
      data: { status },
    });
  }
}