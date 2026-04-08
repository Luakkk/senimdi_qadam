import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Пользователь создаёт заявку — сразу в очередь PENDING
  async create(userId: string, dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        userId,
        fromAddress: dto.fromAddress,
        toAddress: dto.toAddress,
        fromLat: dto.fromLat,
        fromLon: dto.fromLon,
        toLat: dto.toLat,
        toLon: dto.toLon,
        scheduledAt: new Date(dto.scheduledAt),
        disabilityType: dto.disabilityType,
        note: dto.note,
        status: BookingStatus.PENDING,
      },
    });
  }

  // Все мои заявки (свежие сверху)
  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            whatsapp: true,
            vehicleType: true,
            vehicleModel: true,
            licensePlate: true,
            ratingAvg: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Детали одной заявки (с сообщениями)
  async getOne(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            whatsapp: true,
            vehicleType: true,
            vehicleModel: true,
            licensePlate: true,
            ratingAvg: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        review: true,
      },
    });
    if (!booking) throw new NotFoundException('Заявка не найдена');
    return booking;
  }

  // Отмена заявки — только если PENDING или CONFIRMED
  async cancel(userId: string, bookingId: string, reason?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });
    if (!booking) throw new NotFoundException('Заявка не найдена');
    if (
      booking.status === BookingStatus.IN_PROGRESS ||
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        `Нельзя отменить заявку со статусом ${booking.status}`,
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelReason: reason ?? 'Отменено пользователем',
      },
    });
  }
}
