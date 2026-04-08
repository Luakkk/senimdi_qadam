import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerateNewsDto } from './dto/moderate-news.dto';

@Injectable()
export class AdminNewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    status?: NewsStatus;
    q?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.q) {
      where.OR = [
        { titleRu: { contains: params.q, mode: 'insensitive' } },
        { titleKk: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit,
        skip: params.offset,
        include: {
          author: { select: { id: true, email: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ]);

    return { total, limit: params.limit, offset: params.offset, items };
  }

  async stats() {
    const counts = await this.prisma.news.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return counts.reduce((acc, c) => {
      acc[c.status] = c._count._all;
      return acc;
    }, {} as Record<string, number>);
  }

  async moderate(id: string, dto: ModerateNewsDto) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) throw new NotFoundException('News not found');

    return this.prisma.news.update({
      where: { id },
      data: {
        status: dto.status,
        rejectReason: dto.rejectReason ?? null,
        publishedAt: dto.status === NewsStatus.PUBLISHED ? new Date() : news.publishedAt,
      },
    });
  }

  async remove(id: string) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) throw new NotFoundException('News not found');
    await this.prisma.news.delete({ where: { id } });
    return { message: 'News deleted' };
  }
}
