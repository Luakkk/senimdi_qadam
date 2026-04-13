import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DriverStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  // ─── Все водители ──────────────────────────────────────────────────────────
  async findAll(status?: DriverStatus) {
    return this.prisma.driver.findMany({
      where: status ? { status } : {},
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        whatsapp: true,
        vehicleType: true,
        vehicleModel: true,
        licensePlate: true,
        status: true,
        ratingAvg: true,
        ratingCount: true,
      },
      orderBy: { ratingAvg: 'desc' },
    });
  }

  // ─── Один водитель с отзывами ──────────────────────────────────────────────
  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!driver) throw new NotFoundException('Водитель не найден');

    // Добавляем WhatsApp ссылку
    return {
      ...driver,
      whatsappLink: driver.whatsapp
        ? `https://wa.me/${driver.whatsapp.replace(/\D/g, '')}`
        : null,
    };
  }

  // ─── Добавить водителя (менеджер/админ) ───────────────────────────────────
  async create(dto: CreateDriverDto) {
    const existing = await this.prisma.driver.findFirst({
      where: { phone: dto.phone },
    });
    if (existing) throw new ConflictException('Водитель с таким номером уже существует');

    return this.prisma.driver.create({ data: dto });
  }

  // ─── Обновить статус водителя ──────────────────────────────────────────────
  async setStatus(id: string, status: DriverStatus) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException('Водитель не найден');
    return this.prisma.driver.update({ where: { id }, data: { status } });
  }

  // ─── Оставить отзыв после COMPLETED поездки ───────────────────────────────
  async addReview(userId: string, bookingId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, status: 'COMPLETED' },
    });
    if (!booking) {
      throw new BadRequestException('Можно оставить отзыв только после завершённой поездки');
    }
    if (!booking.driverId) {
      throw new BadRequestException('У этой заявки нет водителя');
    }

    // Проверяем дубль
    const exists = await this.prisma.driverReview.findUnique({
      where: { bookingId },
    });
    if (exists) throw new ConflictException('Вы уже оставили отзыв по этой поездке');

    // Создаём отзыв
    const review = await this.prisma.driverReview.create({
      data: {
        bookingId,
        driverId: booking.driverId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    // Пересчитываем рейтинг водителя
    const { _avg, _count } = await this.prisma.driverReview.aggregate({
      where: { driverId: booking.driverId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.driver.update({
      where: { id: booking.driverId },
      data: {
        ratingAvg: _avg.rating ?? 0,
        ratingCount: (_count as { rating: number }).rating,
      },
    });

    return review;
  }
}
