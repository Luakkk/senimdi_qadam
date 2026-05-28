import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { BookingStatus, DisabilityType } from '@prisma/client';
import { parseExpression } from 'cron-parser';

// Timezone for cron calculations — Almaty (UTC+5)
const TZ = 'Asia/Almaty';

// Simple cron validation: delegates to cron-parser for reliable parsing
function isValidCron(expr: string): boolean {
  try {
    parseExpression(expr, { tz: TZ });
    return true;
  } catch {
    return false;
  }
}

/**
 * Вычисляет следующий момент срабатывания по cron-выражению.
 * Использует cron-parser с учётом таймзоны Алматы (Asia/Almaty, UTC+5).
 * Пример: "0 9 * * 1-5" → ближайший будний день в 09:00 по алматинскому времени.
 */
function calcNextRun(cronExpr: string): Date {
  try {
    return parseExpression(cronExpr, { tz: TZ }).next().toDate();
  } catch {
    // Fallback если выражение почему-то невалидно в runtime
    const fallback = new Date();
    fallback.setHours(fallback.getHours() + 1, 0, 0, 0);
    return fallback;
  }
}

interface CreateRecurringDto {
  fromAddress:    string;
  toAddress:      string;
  fromLat?:       number;
  fromLon?:       number;
  toLat?:         number;
  toLon?:         number;
  disabilityType: DisabilityType;
  note?:          string;
  cronExpression: string;
}

// Distributed lock key — один cron-тик на весь кластер (30s TTL)
const RECURRING_LOCK_KEY = 'recurring:lock';
const RECURRING_LOCK_TTL  = 30;

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ── CREATE recurring booking template ───────────────────────────────────
  async create(userId: string, dto: CreateRecurringDto) {
    if (!isValidCron(dto.cronExpression)) {
      throw new BadRequestException(
        'Неверный формат cron-выражения. Используйте 5-частный формат: "0 9 * * 1-5"',
      );
    }

    const rec = await this.prisma.recurringBooking.create({
      data: {
        userId,
        fromAddress:    dto.fromAddress,
        toAddress:      dto.toAddress,
        fromLat:        dto.fromLat,
        fromLon:        dto.fromLon,
        toLat:          dto.toLat,
        toLon:          dto.toLon,
        disabilityType: dto.disabilityType,
        note:           dto.note,
        cronExpression: dto.cronExpression,
        isActive:       true,
        nextRunAt:      calcNextRun(dto.cronExpression),
      },
    });

    return {
      ...rec,
      message: `Расписание создано. Следующая поездка будет создана автоматически по расписанию: ${dto.cronExpression}`,
    };
  }

  // ── LIST user's recurring bookings ──────────────────────────────────────
  async getMyRecurring(userId: string) {
    return this.prisma.recurringBooking.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── PAUSE / RESUME ───────────────────────────────────────────────────────
  async toggleActive(userId: string, id: string, isActive: boolean) {
    const rec = await this.prisma.recurringBooking.findFirst({
      where: { id, userId },
    });
    if (!rec) throw new NotFoundException('Расписание не найдено');

    return this.prisma.recurringBooking.update({
      where: { id },
      data:  { isActive, nextRunAt: isActive ? calcNextRun(rec.cronExpression) : null },
    });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  async remove(userId: string, id: string) {
    const rec = await this.prisma.recurringBooking.findFirst({
      where: { id, userId },
    });
    if (!rec) throw new NotFoundException('Расписание не найдено');
    await this.prisma.recurringBooking.delete({ where: { id } });
    return { message: 'Расписание удалено' };
  }

  // ── SCHEDULER: runs every minute, picks due recurring bookings ───────────
  @Cron(CronExpression.EVERY_MINUTE)
  async processDueRecurring() {
    // Distributed lock — при 2+ репликах только одна обрабатывает тик.
    // SET NX EX: атомарно, если ключ уже есть — другая реплика держит лок.
    const locked = await this.redis.setNX(RECURRING_LOCK_KEY, '1', RECURRING_LOCK_TTL);
    if (!locked) {
      this.logger.debug('recurring: lock held by another instance, skipping');
      return;
    }

    try {
      await this._processRecurring();
    } finally {
      await this.redis.del(RECURRING_LOCK_KEY);
    }
  }

  private async _processRecurring() {
    const now = new Date();

    const dueItems = await this.prisma.recurringBooking.findMany({
      where: {
        isActive:  true,
        nextRunAt: { lte: now },
      },
      take: 50, // process at most 50 per tick to avoid overload
    });

    if (dueItems.length === 0) return;

    this.logger.log(`Processing ${dueItems.length} due recurring bookings`);

    for (const rec of dueItems) {
      try {
        // Create a new booking based on the recurring template
        await this.prisma.booking.create({
          data: {
            userId:         rec.userId,
            fromAddress:    rec.fromAddress,
            toAddress:      rec.toAddress,
            fromLat:        rec.fromLat,
            fromLon:        rec.fromLon,
            toLat:          rec.toLat,
            toLon:          rec.toLon,
            disabilityType: rec.disabilityType,
            note:           rec.note ? `[Авто-расписание] ${rec.note}` : '[Авто-расписание]',
            scheduledAt:    now,
            status:         BookingStatus.PENDING,
          },
        });

        // Update lastTriggeredAt and next run time
        await this.prisma.recurringBooking.update({
          where: { id: rec.id },
          data: {
            lastTriggeredAt: now,
            nextRunAt:       calcNextRun(rec.cronExpression),
          },
        });

        this.logger.log(`Auto-created booking for recurring ${rec.id} (user ${rec.userId})`);
      } catch (err) {
        this.logger.error(`Failed to create booking for recurring ${rec.id}: ${err}`);
      }
    }
  }
}
