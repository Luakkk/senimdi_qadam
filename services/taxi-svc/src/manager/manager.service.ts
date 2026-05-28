import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookingGateway } from '../gateways/booking.gateway';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class ManagerService {
  constructor(
    private prisma: PrismaService,
    private readonly gateway: BookingGateway,
  ) {}

  // ─── Очередь заявок PENDING (FIFO — кто раньше подал) ─────────────────────
  async getQueue() {
    return this.prisma.booking.findMany({
      where: { status: BookingStatus.PENDING },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true, vehicleType: true } },
      },
      orderBy: { createdAt: 'asc' }, // FIFO
    });
  }

  // ─── Все заявки по статусу ─────────────────────────────────────────────────
  async getAllBookings(status?: BookingStatus) {
    return this.prisma.booking.findMany({
      where: status ? { status } : {},
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            vehicleType: true,
            vehicleModel: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Детали одной заявки ───────────────────────────────────────────────────
  async getBookingDetail(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        driver: true,
        messages: { orderBy: { createdAt: 'asc' } },
        review: true,
      },
    });
    if (!booking) throw new NotFoundException('Заявка не найдена');
    return booking;
  }

  // ─── Назначить водителя → статус CONFIRMED ────────────────────────────────
  // Используем транзакцию + условный UPDATE для защиты от гонки условий:
  // если два менеджера одновременно пытаются назначить водителя на одну заявку,
  // updateMany вернёт count=0 для второго — он получит ошибку.
  async assignDriver(managerId: string, bookingId: string, dto: AssignDriverDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Проверяем наличие заявки и водителя (внутри транзакции)
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundException('Заявка не найдена');
      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Можно назначить водителя только к PENDING заявке');
      }

      const driver = await tx.driver.findUnique({ where: { id: dto.driverId } });
      if (!driver) throw new NotFoundException('Водитель не найден');
      if (driver.status !== 'ACTIVE') {
        throw new BadRequestException('Водитель недоступен');
      }

      // 2. Атомарное обновление — WHERE включает status: PENDING.
      // Если другой менеджер уже успел изменить статус, count будет 0.
      const result = await tx.booking.updateMany({
        where: { id: bookingId, status: BookingStatus.PENDING },
        data: {
          driverId: dto.driverId,
          managerId,
          status: BookingStatus.CONFIRMED,
        },
      });

      if (result.count === 0) {
        throw new BadRequestException(
          'Заявка уже была назначена другим менеджером — обновите очередь',
        );
      }

      // 3. Возвращаем обновлённую заявку с деталями водителя
      const updated = await tx.booking.findUnique({
        where: { id: bookingId },
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
            },
          },
        },
      });

      // Уведомить пользователя через WebSocket
      this.gateway.emitBookingStatusChanged(bookingId, BookingStatus.CONFIRMED, dto.driverId);

      return updated;
    });
  }

  // ─── Изменить статус заявки ────────────────────────────────────────────────
  async updateStatus(bookingId: string, dto: UpdateStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Заявка не найдена');

    // Валидация переходов статусов
    const allowed: Partial<Record<BookingStatus, BookingStatus[]>> = {
      [BookingStatus.CONFIRMED]:    [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      [BookingStatus.IN_PROGRESS]:  [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    };

    const allowedNext = allowed[booking.status];
    if (!allowedNext || !allowedNext.includes(dto.status)) {
      throw new ForbiddenException(
        `Переход ${booking.status} → ${dto.status} недопустим`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status,
        ...(dto.cancelReason && { cancelReason: dto.cancelReason }),
      },
    });

    // Real-time WebSocket event → user sees status change immediately
    this.gateway.emitBookingStatusChanged(bookingId, dto.status);

    return updated;
  }

  // ─── Список свободных водителей (для выбора при назначении) ───────────────
  // ACTIVE = не отстранён. Дополнительно фильтруем: нет активных поездок
  // (статус CONFIRMED или IN_PROGRESS), т.е. водитель реально свободен сейчас.
  async getAvailableDrivers() {
    return this.prisma.driver.findMany({
      where: {
        status: 'ACTIVE',
        bookings: {
          none: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
          },
        },
      },
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
        ratingCount: true,
      },
      orderBy: { ratingAvg: 'desc' },
    });
  }

  // ─── Статистика на панели ──────────────────────────────────────────────────
  async getStats() {
    const [pending, confirmed, inProgress, completed, cancelled] = await Promise.all([
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { status: BookingStatus.IN_PROGRESS } }),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
    ]);
    return { pending, confirmed, inProgress, completed, cancelled };
  }
}
