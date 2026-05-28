import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RedisService } from '../redis/redis.service';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(
    private bookingsService: BookingsService,
    private redis: RedisService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать заявку на поездку' })
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои заявки' })
  getMyBookings(@Req() req: any) {
    return this.bookingsService.getMyBookings(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детали заявки (с сообщениями)' })
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.bookingsService.getOne(req.user.sub, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Отменить заявку' })
  cancel(
    @Req() req: any,
    @Param('id') id: string,
    @Query('reason') reason?: string,
  ) {
    return this.bookingsService.cancel(req.user.sub, id, reason);
  }

  // ── Расчёт стоимости поездки ──────────────────────────────────────────────
  @Get('estimate-price')
  @ApiOperation({ summary: 'Предварительный расчёт стоимости поездки' })
  @ApiQuery({ name: 'fromLat',       type: Number })
  @ApiQuery({ name: 'fromLon',       type: Number })
  @ApiQuery({ name: 'toLat',         type: Number })
  @ApiQuery({ name: 'toLon',         type: Number })
  @ApiQuery({ name: 'disabilityType', type: String, required: false })
  estimatePrice(
    @Query('fromLat')       fromLat: string,
    @Query('fromLon')       fromLon: string,
    @Query('toLat')         toLat: string,
    @Query('toLon')         toLon: string,
    @Query('disabilityType') disabilityType = 'OTHER',
  ) {
    return this.bookingsService.estimatePrice(
      parseFloat(fromLat), parseFloat(fromLon),
      parseFloat(toLat),   parseFloat(toLon),
      disabilityType,
    );
  }

  // ── Инициировать оплату ───────────────────────────────────────────────────
  @Post(':id/payment')
  @ApiOperation({ summary: 'Инициировать оплату заявки (Kaspi или наличные)' })
  initiatePayment(
    @Req() req: any,
    @Param('id') id: string,
    @Query('method') method: PaymentMethod = PaymentMethod.CASH,
  ) {
    return this.bookingsService.initiatePayment(req.user.sub, id, method);
  }

  // ── Подтвердить оплату (webhook) ──────────────────────────────────────────
  @Patch(':id/payment/:txId/confirm')
  @ApiOperation({ summary: 'Подтвердить оплату (вызывается платёжным шлюзом или вручную)' })
  confirmPayment(@Param('id') id: string, @Param('txId') txId: string) {
    return this.bookingsService.confirmPayment(id, txId);
  }

  // ── GET /bookings/:id/driver-location ─────────────────────────────────────
  // Возвращает последние GPS-координаты водителя из Redis + расчёт ETA
  @Get(':id/driver-location')
  @ApiOperation({ summary: 'Местоположение водителя + ETA (из Redis, TTL 60с)' })
  async getDriverLocation(@Req() req: any, @Param('id') id: string) {
    const booking = await this.bookingsService.getOne(req.user.sub, id);

    if (!booking.driverId) {
      return { available: false, message: 'Водитель ещё не назначен' };
    }

    const raw = await this.redis.get(`driver:${booking.driverId}:location`);
    if (!raw) {
      return { available: false, message: 'Местоположение водителя недоступно' };
    }

    const location: { lat: number; lon: number; updatedAt: string } = JSON.parse(raw);

    // ETA: Haversine distance from driver → pickup, speed 30 km/h
    const etaMinutes = booking.fromLat && booking.fromLon
      ? calcEtaMinutes(location.lat, location.lon, booking.fromLat, booking.fromLon)
      : null;

    return {
      available: true,
      driverId:  booking.driverId,
      lat:       location.lat,
      lon:       location.lon,
      updatedAt: location.updatedAt,
      etaMinutes,
    };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function toRad(x: number) { return (x * Math.PI) / 180; }

function calcEtaMinutes(dLat: number, dLon: number, toLat: number, toLon: number): number {
  const R = 6371;
  const dlatR = toRad(toLat - dLat);
  const dlonR = toRad(toLon - dLon);
  const a =
    Math.sin(dlatR / 2) ** 2 +
    Math.cos(toRad(dLat)) * Math.cos(toRad(toLat)) * Math.sin(dlonR / 2) ** 2;
  const distKm = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((distKm / 30) * 60); // 30 km/h average speed
}
