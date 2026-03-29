import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuideDto } from './dto/create-guide.dto';

@Injectable()
export class GuidesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Публичный список (только опубликованные) ─────────────────────────────
  async list(category?: string, limit = 20, offset = 0) {
    const where: any = { isPublished: true };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.guide.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        select: {
          id: true, titleRu: true, titleKk: true,
          category: true, tags: true, likesCount: true, createdAt: true,
        },
      }),
      this.prisma.guide.count({ where }),
    ]);
    return { items, total };
  }

  // ── Детальная страница ────────────────────────────────────────────────────
  async getById(id: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide || !guide.isPublished) throw new NotFoundException('Гайд не найден');
    return guide;
  }

  // ── Создать гайд ──────────────────────────────────────────────────────────
  async create(dto: CreateGuideDto, authorId: string) {
    return this.prisma.guide.create({
      data: {
        titleRu:     dto.titleRu,
        titleKk:     dto.titleKk ?? null,
        bodyRu:      dto.bodyRu,
        bodyKk:      dto.bodyKk ?? null,
        category:    dto.category ?? null,
        tags:        dto.tags ?? [],
        isPublished: dto.isPublished ?? false,
        authorId,
      },
    });
  }

  // ── Опубликовать / снять ──────────────────────────────────────────────────
  async setPublished(id: string, isPublished: boolean) {
    const guide = await this.prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException('Гайд не найден');
    return this.prisma.guide.update({ where: { id }, data: { isPublished } });
  }

  // ── Лайк / убрать лайк (toggle) ──────────────────────────────────────────
  async toggleLike(guideId: string, userId: string) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId } });
    if (!guide || !guide.isPublished) throw new NotFoundException('Гайд не найден');

    const existing = await this.prisma.guideLike.findUnique({
      where: { guideId_userId: { guideId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.guideLike.delete({ where: { guideId_userId: { guideId, userId } } }),
        this.prisma.guide.update({ where: { id: guideId }, data: { likesCount: { decrement: 1 } } }),
      ]);
      return { liked: false, message: 'Лайк убран' };
    } else {
      await this.prisma.$transaction([
        this.prisma.guideLike.create({ data: { guideId, userId } }),
        this.prisma.guide.update({ where: { id: guideId }, data: { likesCount: { increment: 1 } } }),
      ]);
      return { liked: true, message: 'Лайк поставлен' };
    }
  }
}
