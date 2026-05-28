import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildCursorPage } from '../common/dto/cursor-pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyNotifications(
    userId: string,
    limit = 20,
    cursor?: string,
    unreadOnly = false,
  ) {
    const take = limit + 1;
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const items = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const { items: page, nextCursor } = buildCursorPage(items, limit);

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { items: page, nextCursor, unreadCount };
  }

  async markRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data:  { isRead: true },
    });
    return { success: true };
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data:  { isRead: true },
    });
    return { marked: count };
  }
}
