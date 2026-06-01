import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildCursorPage } from '../common/dto/cursor-pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET: личные + broadcast (userId = null) уведомления ──────────────────
  async getMyNotifications(
    userId: string,
    limit = 20,
    cursor?: string,
    unreadOnly = false,
  ) {
    const take = limit + 1;

    // Личные уведомления + broadcast (userId IS NULL — для всех пользователей)
    const baseWhere: any = { OR: [{ userId }, { userId: null }] };
    const where: any = unreadOnly
      ? { ...baseWhere, isRead: false }
      : baseWhere;

    const items = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const { items: page, nextCursor } = buildCursorPage(items, limit);

    const unreadCount = await this.prisma.notification.count({
      where: { OR: [{ userId }, { userId: null }], isRead: false },
    });

    return { items: page, nextCursor, unreadCount };
  }

  async markRead(userId: string, notificationId: string) {
    // Можно отметить личное или broadcast уведомление
    await this.prisma.notification.updateMany({
      where: { id: notificationId, OR: [{ userId }, { userId: null }] },
      data:  { isRead: true },
    });
    return { success: true };
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { OR: [{ userId }, { userId: null }], isRead: false },
      data:  { isRead: true },
    });
    return { marked: count };
  }

  // ── CREATE: уведомление для конкретного пользователя ─────────────────────
  // Вызывается из internal controller (межсервисные события)
  async createForUser(params: {
    userId: string;
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        title:  params.title,
        body:   params.body,
        type:   params.type,
        data:   params.data ? (params.data as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  // ── CREATE BROADCAST: одна запись видна всем пользователям ───────────────
  // userId = null → "рассылка". getMyNotifications включает такие записи.
  async createBroadcast(params: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: null,
        title:  params.title,
        body:   params.body,
        type:   params.type,
        data:   params.data ? (params.data as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }
}
