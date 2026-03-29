import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Создать бронирование (anti double-booking через slotId @unique + transaction)
  async create(userId: string, dto: CreateBookingDto) {
    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({ where: { id: dto.slotId } });

      if (!slot) throw new NotFoundException('Слот не найден');
      if (slot.isBooked) throw new ConflictException('Слот уже занят');

      // Блокируем слот
      await tx.slot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      // Создаём бронирование (slotId @unique защищает от race condition)
      const booking = await tx.booking.create({
        data: {
          slotId: dto.slotId,
          driverId: slot.driverId,
          userId,
          fromAddress: dto.fromAddress,
          toAddress: dto.toAddress,
          fromLat: dto.fromLat,
          fromLon: dto.fromLon,
          toLat: dto.toLat,
          toLon: dto.toLon,
          note: dto.note,
        },
        include: {
          slot: true,
          driver: true,
        },
      });

      return booking;
    });
  }

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { slot: true, driver: true, review: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });
    if (!booking) throw new NotFoundException('Бронирование не найдено');

    return this.prisma.$transaction(async (tx) => {
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });
    });
  }

  // Ближайшие доступные водители (Haversine формула в SQL)
  async findNearbyDrivers(lat: number, lon: number, radiusKm = 10) {
    const drivers = await this.prisma.$queryRaw<any[]>`
      SELECT
        d.*,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(d.lat)) *
          cos(radians(d.lon) - radians(${lon})) +
          sin(radians(${lat})) * sin(radians(d.lat))
        )) AS distance_km
      FROM "Driver" d
      WHERE d.status = 'ACTIVE'
        AND d.lat IS NOT NULL
        AND d.lon IS NOT NULL
      HAVING (6371 * acos(
          cos(radians(${lat})) * cos(radians(d.lat)) *
          cos(radians(d.lon) - radians(${lon})) +
          sin(radians(${lat})) * sin(radians(d.lat))
        )) < ${radiusKm}
      ORDER BY distance_km
      LIMIT 20
    `;
    return drivers;
  }
}
