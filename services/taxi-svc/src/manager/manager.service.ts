import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

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
  async assignDriver(managerId: string, bookingId: string, dto: AssignDriverDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Заявка не найдена');
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Можно назначить водителя только к PENDING заявке');
    }

    const driver = await this.prisma.driver.findUnique({ where: { id: dto.driverId } });
    if (!driver) throw new NotFoundException('Водитель не найден');
    if (driver.status !== 'ACTIVE') {
      throw new BadRequestException('Водитель недоступен');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId: dto.driverId,
        managerId,
        status: BookingStatus.CONFIRMED,
      },
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

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status,
        ...(dto.cancelReason && { cancelReason: dto.cancelReason }),
      },
    });
  }

  // ─── Список свободных водителей (для выбора при назначении) ───────────────
  async getAvailableDrivers() {
    return this.prisma.driver.findMany({
      where: { status: 'ACTIVE' },
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
