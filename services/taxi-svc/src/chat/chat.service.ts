import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageSender } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ─── Список сообщений по заявке ───────────────────────────────────────────
  async getMessages(bookingId: string, requesterId: string, isManager: boolean) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Заявка не найдена');

    // Пользователь видит только свои заявки
    if (!isManager && booking.userId !== requesterId) {
      throw new ForbiddenException('Нет доступа к этой заявке');
    }

    // Помечаем входящие сообщения как прочитанные
    const markReadSender = isManager ? MessageSender.USER : MessageSender.MANAGER;
    await this.prisma.bookingMessage.updateMany({
      where: { bookingId, senderType: markReadSender, isRead: false },
      data: { isRead: true },
    });

    return this.prisma.bookingMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Отправить сообщение от пользователя ──────────────────────────────────
  async sendAsUser(userId: string, bookingId: string, dto: SendMessageDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });
    if (!booking) throw new NotFoundException('Заявка не найдена');

    return this.prisma.bookingMessage.create({
      data: {
        bookingId,
        senderId: userId,
        senderType: MessageSender.USER,
        text: dto.text,
      },
    });
  }

  // ─── Отправить сообщение от менеджера ─────────────────────────────────────
  async sendAsManager(managerId: string, bookingId: string, dto: SendMessageDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Заявка не найдена');

    return this.prisma.bookingMessage.create({
      data: {
        bookingId,
        managerId,
        senderId: managerId,
        senderType: MessageSender.MANAGER,
        text: dto.text,
      },
    });
  }

  // ─── Количество непрочитанных (для badge) ─────────────────────────────────
  async getUnreadCount(userId: string, isManager: boolean) {
    const targetSender = isManager ? MessageSender.USER : MessageSender.MANAGER;

    if (isManager) {
      // Менеджер: непрочитанные сообщения от пользователей по всем заявкам
      return this.prisma.bookingMessage.count({
        where: { senderType: targetSender, isRead: false },
      });
    } else {
      // Пользователь: непрочитанные ответы менеджера в его заявках
      const myBookings = await this.prisma.booking.findMany({
        where: { userId },
        select: { id: true },
      });
      const bookingIds = myBookings.map((b) => b.id);
      return this.prisma.bookingMessage.count({
        where: { bookingId: { in: bookingIds }, senderType: targetSender, isRead: false },
      });
    }
  }
}
