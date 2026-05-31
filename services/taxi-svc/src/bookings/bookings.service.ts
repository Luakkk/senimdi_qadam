import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from '../fcm/fcm.service';
import { CreateBookingDto } from './dto/create-booking.dto';

// ── Haversine distance helper ─────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toR = (d: number) => (d * Math.PI) / 180;
  const dlat = toR(lat2 - lat1);
  const dlon = toR(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dlon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Pricing constants (KZT) ───────────────────────────────────────────────────
const BASE_FARE    = 800;   // минимальная стоимость поездки
const RATE_PER_KM  = 150;   // тенге за км
const WHEELCHAIR_SURCHARGE = 300; // надбавка за кресло

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private fcm: FcmService,
  ) {}

  // Пользователь создаёт заявку — сразу в очередь PENDING
  async create(userId: string, dto: CreateBookingDto) {
    // Pre-calculate estimated price if coordinates are provided
    let estimatedPrice: number | undefined;
    if (dto.fromLat && dto.fromLon && dto.toLat && dto.toLon) {
      const est = this.estimatePrice(
        dto.fromLat, dto.fromLon,
        dto.toLat, dto.toLon,
        dto.disabilityType,
      );
      estimatedPrice = est.price;
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        fromAddress: dto.fromAddress,
        toAddress:   dto.toAddress,
        fromLat:     dto.fromLat,
        fromLon:     dto.fromLon,
        toLat:       dto.toLat,
        toLon:       dto.toLon,
        scheduledAt:    new Date(dto.scheduledAt),
        disabilityType: dto.disabilityType,
        note:           dto.note,
        status:         BookingStatus.PENDING,
        estimatedPrice,
      },
    });

    // Уведомить активных водителей о новой заявке
    const drivers = await this.prisma.driver.findMany({
      where: { status: 'ACTIVE', fcmToken: { not: null } },
      select: { fcmToken: true },
    });
    const tokens = drivers.map(d => d.fcmToken!).filter(Boolean);
    this.fcm.sendMulticast(tokens, {
      title: '🚖 Новая заявка',
      body:  `${dto.fromAddress} → ${dto.toAddress}`,
      data:  { bookingId: booking.id, type: 'new_booking' },
    }).catch(() => {/* ignore */});

    return booking;
  }

  // Все мои заявки — cursor-based pagination
  async getMyBookings(userId: string, limit = 20, cursor?: string) {
    const take = Number(limit) + 1;
    const items = await this.prisma.booking.findMany({
      where: { userId },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
    const hasNext = items.length > Number(limit);
    const page = hasNext ? items.slice(0, Number(limit)) : items;
    return { items: page, nextCursor: hasNext ? page[page.length - 1].id : null };
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

  // ── Расчёт стоимости поездки ──────────────────────────────────────────────
  estimatePrice(
    fromLat: number, fromLon: number,
    toLat: number, toLon: number,
    disabilityType: string,
  ): { distanceKm: number; price: number; breakdown: Record<string, number> } {
    const distanceKm = haversineKm(fromLat, fromLon, toLat, toLon);
    const base       = BASE_FARE;
    const distance   = Math.round(distanceKm * RATE_PER_KM);
    const surcharge  = disabilityType === 'WHEELCHAIR' ? WHEELCHAIR_SURCHARGE : 0;
    const price      = base + distance + surcharge;

    return {
      distanceKm: Math.round(distanceKm * 10) / 10,
      price,
      breakdown: { base, distance, surcharge },
    };
  }

  // ── Создать платёжную транзакцию (Kaspi / наличные) ──────────────────────
  //
  // ⚠️  MOCK IMPLEMENTATION (Дипломный проект)
  //    CASH:  сразу помечается PAID — реальная логика.
  //    KASPI: генерируется заглушка-ссылка.
  //           Production-интеграция требует подключения к Kaspi Pay API:
  //           https://pay.kaspi.kz/pay/integration — подписанный webhook
  //           для подтверждения платежа (HMAC-SHA256 верификация).
  //    CARD:  аналогично — требует Stripe/PayBox/CloudPayments интеграцию.
  //
  async initiatePayment(
    userId: string,
    bookingId: string,
    method: PaymentMethod,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });
    if (!booking) throw new NotFoundException('Заявка не найдена');

    // Нельзя оплатить отменённую или уже завершённую поездку
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Нельзя оплатить заявку со статусом ${booking.status}`,
      );
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Заявка уже оплачена');
    }

    const amount = booking.estimatedPrice ?? BASE_FARE;

    // CASH — подтверждается сразу (водитель получает наличными).
    // KASPI/CARD — переводятся в PENDING, требуют подтверждения через webhook.
    const isInstant = method === PaymentMethod.CASH;

    // MOCK: для KASPI генерируем заглушку-ссылку.
    // В production заменить на реальный Kaspi Pay API вызов:
    //   POST https://kaspi.kz/online/api/operations — получить paymentUrl из ответа.
    const mockKaspiUrl = `https://pay.kaspi.kz/pay?amount=${amount}&order=${bookingId}&MOCK=true`;

    const tx = await this.prisma.paymentTransaction.create({
      data: {
        bookingId,
        userId,
        amount,
        method,
        status:      isInstant ? PaymentStatus.PAID : PaymentStatus.PENDING,
        externalId:  isInstant ? null : `MOCK-KASPI-${Date.now()}`,
        externalUrl: isInstant ? null : mockKaspiUrl,
        metadata:    isInstant ? null : { mock: true, note: 'Replace with real Kaspi Pay API in production' },
      },
    });

    // Update booking payment status
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus:  isInstant ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paymentMethod: method,
      },
    });

    return {
      transactionId: tx.id,
      status:        tx.status,
      amount,
      method,
      paymentUrl:    tx.externalUrl ?? null,
      isMock:        !isInstant, // явно сигнализируем фронту что это заглушка
      message:       isInstant
        ? 'Оплата наличными подтверждена'
        : '[MOCK] Тестовая ссылка Kaspi. В production требуется реальная интеграция с Kaspi Pay API.',
    };
  }

  // ── Подтверждение оплаты (webhook) ────────────────────────────────────────
  //
  // ⚠️  MOCK: принимает любые параметры без верификации подписи.
  //    Production-реализация должна:
  //    1. Проверить HMAC-SHA256 подпись от Kaspi Pay в заголовке X-Kaspi-Signature.
  //    2. Сверить сумму и orderId с данными в БД (защита от подмены суммы).
  //    3. Ответить 200 OK только после успешной проверки.
  //
  async confirmPayment(bookingId: string, transactionId: string) {
    const tx = await this.prisma.paymentTransaction.findFirst({
      where: { id: transactionId, bookingId },
    });
    if (!tx) throw new NotFoundException('Транзакция не найдена');

    await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: { status: PaymentStatus.PAID },
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: PaymentStatus.PAID },
    });

    return { success: true, transactionId, bookingId };
  }
}
