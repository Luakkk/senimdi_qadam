import {
  ConflictException,
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgReviewDto } from './dto/create-org-review.dto';
import { CreateSpecialistReviewDto } from './dto/create-specialist-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Отзыв на организацию ─────────────────────────────────────────────────

  async createOrgReview(
    organizationId: string,
    userId: string,
    dto: CreateOrgReviewDto,
  ) {
    // Проверяем что организация существует
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Организация не найдена');

    // Создаём отзыв (@@unique[organizationId, userId] защищает от дублей)
    let review: any;
    try {
      review = await this.prisma.orgReview.create({
        data: {
          organizationId,
          userId,
          rating: dto.rating,
          comment: dto.comment ?? null,
        },
      });
    } catch (e: any) {
      // P2002 = unique constraint violation
      if (e.code === 'P2002') {
        throw new ConflictException('Вы уже оставляли отзыв на эту организацию');
      }
      throw e;
    }

    // Пересчитываем ratingAvg и ratingCount через транзакцию (highload-safe)
    await this.prisma.$transaction(async (tx) => {
      const agg = await tx.orgReview.aggregate({
        where: { organizationId },
        _avg: { rating: true },
        _count: { id: true },
      });
      await tx.organization.update({
        where: { id: organizationId },
        data: {
          ratingAvg:   agg._avg.rating ?? 0,
          ratingCount: agg._count.id,
        },
      });
    });

    return review;
  }

  async listOrgReviews(organizationId: string, limit = 20, offset = 0) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Организация не найдена');

    const [items, total] = await Promise.all([
      this.prisma.orgReview.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          userId: true,   // не передаём email — приватность
        },
      }),
      this.prisma.orgReview.count({ where: { organizationId } }),
    ]);

    return { items, total, ratingAvg: org.ratingAvg, ratingCount: org.ratingCount };
  }

  // ── Отзыв на специалиста ─────────────────────────────────────────────────

  async createSpecialistReview(
    targetUserId: string,
    authorId: string,
    dto: CreateSpecialistReviewDto,
  ) {
    // Нельзя оценить самого себя
    if (targetUserId === authorId) {
      throw new BadRequestException('Нельзя оставить отзыв на себя');
    }

    // Проверяем что специалист существует
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!target) throw new NotFoundException('Специалист не найден');

    try {
      return await this.prisma.specialistReview.create({
        data: {
          targetUserId,
          authorId,
          rating:  dto.rating,
          comment: dto.comment ?? null,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Вы уже оставляли отзыв на этого специалиста');
      }
      throw e;
    }
  }

  async listSpecialistReviews(targetUserId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.specialistReview.findMany({
        where: { targetUserId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          authorId: true,
        },
      }),
      this.prisma.specialistReview.count({ where: { targetUserId } }),
    ]);

    return { items, total };
  }
}
