import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterManagerDto } from './dto/register-manager.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ManagerAuthService {
  constructor(private prisma: PrismaService) {}

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

    return {
      message: 'Профиль менеджера создан. Роль TAXI_MANAGER будет активирована администратором.',
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
