import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { NewsStatus, NewsCommentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { ModerateNewsDto } from './dto/moderate-news.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Публичная лента: sort=popular (по лайкам) или sort=latest (по дате) ───
  async listPublished(limit = 20, offset = 0, sort: 'popular' | 'latest' = 'latest') {
    const orderBy =
      sort === 'popular'
        ? [{ likesCount: 'desc' as const }, { publishedAt: 'desc' as const }]
        : [{ publishedAt: 'desc' as const }];

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where: { status: NewsStatus.PUBLISHED },
        orderBy,
        take: Number(limit),
        skip: Number(offset),
        select: {
          id: true,
          titleRu: true,
          titleKk: true,
          imageUrl: true,
          publishedAt: true,
          authorId: true,
          likesCount: true,
          commentsCount: true,
        },
      }),
      this.prisma.news.count({ where: { status: NewsStatus.PUBLISHED } }),
    ]);
    return { items, total };
  }

  // ── Полная карточка (только PUBLISHED) ───────────────────────────────────
  async getById(id: string) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news || news.status !== NewsStatus.PUBLISHED) {
      throw new NotFoundException('Новость не найдена');
    }
    return news;
  }

  // ── Создать новость ───────────────────────────────────────────────────────
  async create(dto: CreateNewsDto, authorId: string) {
    return this.prisma.news.create({
      data: {
        titleRu:  dto.titleRu,
        titleKk:  dto.titleKk  ?? null,
        bodyRu:   dto.bodyRu,
        bodyKk:   dto.bodyKk   ?? null,
        imageUrl: dto.imageUrl ?? null,
        authorId,
        status: NewsStatus.PENDING,
      },
    });
  }

  // ── Загрузить фото к новости ──────────────────────────────────────────────
  async updateImage(newsId: string, userId: string, filename: string) {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news) throw new NotFoundException('Новость не найдена');
    if (news.authorId !== userId) throw new ForbiddenException('Нет прав');

    return this.prisma.news.update({
      where: { id: newsId },
      data: { imageUrl: `/uploads/news/${filename}` },
    });
  }

  // ── Мои новости ───────────────────────────────────────────────────────────
  async listMy(authorId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where: { authorId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.news.count({ where: { authorId } }),
    ]);
    return { items, total };
  }

  // ── Очередь модерации новостей ────────────────────────────────────────────
  async listPending(limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where: { status: NewsStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.news.count({ where: { status: NewsStatus.PENDING } }),
    ]);
    return { items, total };
  }

  // ── Модерировать новость ──────────────────────────────────────────────────
  async moderate(id: string, dto: ModerateNewsDto, moderatorRole: Role) {
    if (moderatorRole !== Role.MODERATOR && moderatorRole !== Role.ADMIN) {
      throw new ForbiddenException('Только модератор или администратор');
    }

    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) throw new NotFoundException('Новость не найдена');
    if (news.status !== NewsStatus.PENDING) {
      throw new ForbiddenException('Новость уже прошла модерацию');
    }

    return this.prisma.news.update({
      where: { id },
      data: {
        status:       dto.status,
        rejectReason: dto.status === NewsStatus.REJECTED ? (dto.rejectReason ?? null) : null,
        publishedAt:  dto.status === NewsStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  // ── Удалить новость ───────────────────────────────────────────────────────
  async remove(id: string, userId: string, role: Role) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) throw new NotFoundException('Новость не найдена');

    if (news.authorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('Нет прав для удаления');
    }

    await this.prisma.news.delete({ where: { id } });
    return { message: 'Новость удалена' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ЛАЙКИ
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Поставить / убрать лайк (toggle) ─────────────────────────────────────
  async toggleLike(newsId: string, userId: string) {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news || news.status !== NewsStatus.PUBLISHED) {
      throw new NotFoundException('Новость не найдена');
    }

    const existing = await this.prisma.newsLike.findUnique({
      where: { newsId_userId: { newsId, userId } },
    });

    if (existing) {
      // убираем лайк
      await this.prisma.$transaction([
        this.prisma.newsLike.delete({ where: { newsId_userId: { newsId, userId } } }),
        this.prisma.news.update({
          where: { id: newsId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false, message: 'Лайк убран' };
    } else {
      // ставим лайк
      await this.prisma.$transaction([
        this.prisma.newsLike.create({ data: { newsId, userId } }),
        this.prisma.news.update({
          where: { id: newsId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
      return { liked: true, message: 'Лайк поставлен' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // КОММЕНТАРИИ
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Написать комментарий (PENDING — ждёт модерации) ───────────────────────
  async createComment(newsId: string, authorId: string, dto: CreateCommentDto) {
    const news = await this.prisma.news.findUnique({ where: { id: newsId } });
    if (!news || news.status !== NewsStatus.PUBLISHED) {
      throw new NotFoundException('Новость не найдена');
    }

    return this.prisma.newsComment.create({
      data: {
        newsId,
        authorId,
        text: dto.text,
        status: NewsCommentStatus.PENDING,
      },
    });
  }

  // ── Список опубликованных комментариев (публичный) ────────────────────────
  async listComments(newsId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.newsComment.findMany({
        where: { newsId, status: NewsCommentStatus.PUBLISHED },
        orderBy: { createdAt: 'asc' },
        take: Number(limit),
        skip: Number(offset),
        select: {
          id: true,
          authorId: true,
          text: true,
          createdAt: true,
        },
      }),
      this.prisma.newsComment.count({
        where: { newsId, status: NewsCommentStatus.PUBLISHED },
      }),
    ]);
    return { items, total };
  }

  // ── Удалить свой комментарий ──────────────────────────────────────────────
  async deleteComment(commentId: string, userId: string, role: Role) {
    const comment = await this.prisma.newsComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Комментарий не найден');

    if (comment.authorId !== userId && role !== Role.ADMIN && role !== Role.MODERATOR) {
      throw new ForbiddenException('Нет прав для удаления');
    }

    // если был опубликован — уменьшаем счётчик
    if (comment.status === NewsCommentStatus.PUBLISHED) {
      await this.prisma.$transaction([
        this.prisma.newsComment.delete({ where: { id: commentId } }),
        this.prisma.news.update({
          where: { id: comment.newsId },
          data: { commentsCount: { decrement: 1 } },
        }),
      ]);
    } else {
      await this.prisma.newsComment.delete({ where: { id: commentId } });
    }

    return { message: 'Комментарий удалён' };
  }

  // ── Очередь модерации комментариев (MODERATOR/ADMIN) ─────────────────────
  async listPendingComments(limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.newsComment.findMany({
        where: { status: NewsCommentStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.prisma.newsComment.count({ where: { status: NewsCommentStatus.PENDING } }),
    ]);
    return { items, total };
  }

  // ── Модерировать комментарий ──────────────────────────────────────────────
  async moderateComment(commentId: string, dto: ModerateCommentDto, role: Role) {
    if (role !== Role.MODERATOR && role !== Role.ADMIN) {
      throw new ForbiddenException('Только модератор или администратор');
    }

    const comment = await this.prisma.newsComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Комментарий не найден');
    if (comment.status !== NewsCommentStatus.PENDING) {
      throw new BadRequestException('Комментарий уже прошёл модерацию');
    }

    // если одобряем — увеличиваем счётчик у новости
    if (dto.status === 'PUBLISHED') {
      await this.prisma.$transaction([
        this.prisma.newsComment.update({
          where: { id: commentId },
          data: { status: NewsCommentStatus.PUBLISHED },
        }),
        this.prisma.news.update({
          where: { id: comment.newsId },
          data: { commentsCount: { increment: 1 } },
        }),
      ]);
    } else {
      await this.prisma.newsComment.update({
        where: { id: commentId },
        data: { status: NewsCommentStatus.REJECTED },
      });
    }

    return { message: `Комментарий ${dto.status === 'PUBLISHED' ? 'одобрен' : 'отклонён'}` };
  }
}
