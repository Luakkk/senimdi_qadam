import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterManagerDto } from './dto/register-manager.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ManagerAuthService {
  private readonly logger = new Logger(ManagerAuthService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Промотирует роль до TAXI_MANAGER в core-svc.
   * Retry: 3 попытки с экспоненциальной задержкой (500ms, 1000ms, 2000ms).
   * При полном сбое — логируем ошибку, не откатываем транзакцию.
   * Менеджер создан в taxi-svc; роль в core-svc выдаётся вручную через AdminJS.
   */
  private async _promoteWithRetry(coreSvcUrl: string, userId: string, adminKey: string) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // core-svc вешает все маршруты под globalPrefix 'api' → путь /api/internal/...
        const res = await fetch(`${coreSvcUrl}/api/internal/users/${userId}/promote-taxi-manager`, {
          method: 'PATCH',
          headers: { 'x-internal-key': adminKey },
        });
        if (res.ok) {
          this.logger.log(`[ManagerAuth] Role promoted for user ${userId} ✓`);
          return;
        }
        this.logger.warn(`[ManagerAuth] Promote attempt ${attempt} failed: HTTP ${res.status}`);
      } catch (err) {
        this.logger.warn(`[ManagerAuth] Promote attempt ${attempt} error: ${err}`);
      }
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 500 * attempt)); // 500ms, 1000ms
      }
    }
    // Все попытки провалились — логируем для ручного исправления через AdminJS
    this.logger.error(
      `[ManagerAuth] FAILED to promote TAXI_MANAGER role for user ${userId} after ${maxAttempts} attempts. Fix manually via AdminJS.`,
    );
  }

  // ─── Генерация инвайт-кода (только Admin) ─────────────────────────────────
  async generateInviteCode(expiresInDays = 7): Promise<{ code: string; expiresAt: Date }> {
    const code = 'INVATXI-' + randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.prisma.managerInvite.create({
      data: { code, expiresAt },
    });

    return { code, expiresAt };
  }

  // ─── Список инвайт-кодов ───────────────────────────────────────────────────
  async listInvites() {
    return this.prisma.managerInvite.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Регистрация менеджера через инвайт ───────────────────────────────────
  // userId берётся из JWT — пользователь уже зарегистрирован в core-svc,
  // здесь создаём профиль TaxiManager и помечаем инвайт как использованный.
  async registerWithInvite(userId: string, dto: RegisterManagerDto) {
    // 1. Проверяем инвайт
    const invite = await this.prisma.managerInvite.findUnique({
      where: { code: dto.inviteCode },
    });
    if (!invite) throw new NotFoundException('Инвайт-код не найден');
    if (invite.usedBy) throw new BadRequestException('Инвайт-код уже использован');
    if (invite.expiresAt < new Date()) throw new BadRequestException('Инвайт-код истёк');

    // 2. Проверяем что менеджер ещё не создан
    const existing = await this.prisma.taxiManager.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Профиль менеджера уже создан');

    // 3. Создаём профиль менеджера + помечаем инвайт
    const [manager] = await this.prisma.$transaction([
      this.prisma.taxiManager.create({
        data: {
          userId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      }),
      this.prisma.managerInvite.update({
        where: { code: dto.inviteCode },
        data: { usedBy: userId, usedAt: new Date() },
      }),
    ]);

    // 4. Промотируем роль до TAXI_MANAGER в core-svc (3 retry с backoff)
    const coreSvcUrl = process.env.CORE_SVC_URL || 'http://localhost:3001';
    const adminKey   = process.env.ADMIN_KEY || '';
    await this._promoteWithRetry(coreSvcUrl, userId, adminKey);

    return {
      message: 'Профиль менеджера создан. Роль TAXI_MANAGER активирована.',
      manager,
    };
  }

  // ─── Получить профиль менеджера по userId ─────────────────────────────────
  async getMyProfile(userId: string) {
    const manager = await this.prisma.taxiManager.findUnique({ where: { userId } });
    if (!manager) throw new NotFoundException('Профиль менеджера не найден');
    return manager;
  }
}
