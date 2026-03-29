import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestLinkDto } from './dto/request-link.dto';
import { Role } from '@prisma/client';

const PUBLIC_CACHE_TTL = 60 * 5; // 5 минут

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ── ПРИВАТНЫЙ профиль (только свой) ──────────────────────────────────────
  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
      omit: { passwordHash: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  // ── ПУБЛИЧНЫЙ профиль (кэш Redis → Postgres) ─────────────────────────────
  async getPublicProfile(profileId: string) {
    const cacheKey = `public_profile:${profileId}`;

    // Read Side: сначала проверяем кэш
    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const user = await this.prisma.user.findUnique({
      where: { id: profileId },
      include: { profile: true, news: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: { id: true, titleRu: true, imageUrl: true, publishedAt: true },
      }},
    });
    if (!user) throw new NotFoundException('Профиль не найден');

    // Публичный DTO — никогда не отдаём приватные поля
    const publicData = {
      id:        user.id,
      firstName: user.profile?.firstName ?? null,
      lastName:  user.profile?.lastName  ?? null,
      city:      user.profile?.city      ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      // Тип инвалидности показываем только для USER
      disabilityType: user.role === Role.USER ? (user.profile?.disabilityType ?? null) : null,
      role:      user.role,
      // Последние 5 публикаций как "тред"
      recentNews: user.news,
    };

    // Write to cache (Write Side — инвалидируем при обновлении профиля)
    await this.setPublicCache(profileId, publicData);
    return publicData;
  }

  // ── ОБНОВИТЬ профиль → инвалидировать кэш ────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto, userRole: Role) {
    // RELATIVE не может заполнять поля инвалидности
    if (userRole === Role.RELATIVE) {
      delete dto.disabilityType;
      delete dto.disabilityNote;
    }

    const profile = await this.prisma.userProfile.upsert({
      where:  { userId },
      update: {
        ...(dto.firstName      !== undefined && { firstName:      dto.firstName }),
        ...(dto.lastName       !== undefined && { lastName:       dto.lastName }),
        ...(dto.phone          !== undefined && { phone:          dto.phone }),
        ...(dto.birthDate      !== undefined && { birthDate:      new Date(dto.birthDate) }),
        ...(dto.city           !== undefined && { city:           dto.city }),
        ...(dto.disabilityType !== undefined && { disabilityType: dto.disabilityType }),
        ...(dto.disabilityNote !== undefined && { disabilityNote: dto.disabilityNote }),
      },
      create: {
        userId,
        firstName:      dto.firstName      ?? '',
        lastName:       dto.lastName       ?? '',
        phone:          dto.phone          ?? null,
        birthDate:      dto.birthDate ? new Date(dto.birthDate) : null,
        city:           dto.city           ?? null,
        disabilityType: dto.disabilityType ?? null,
        disabilityNote: dto.disabilityNote ?? null,
      },
    });

    // Инвалидируем публичный кэш
    await this.invalidatePublicCache(userId);
    return profile;
  }

  // ── АВАТАР ────────────────────────────────────────────────────────────────
  async updateAvatar(userId: string, filename: string) {
    const avatarUrl = `/uploads/avatars/${filename}`;

    await this.prisma.userProfile.upsert({
      where:  { userId },
      update: { avatarUrl },
      create: { userId, firstName: '', lastName: '', avatarUrl },
    });

    await this.invalidatePublicCache(userId);
    return { avatarUrl };
  }

  // ── RELATIVE LINKS ────────────────────────────────────────────────────────

  // Родственник отправляет запрос
  async requestLink(guardianId: string, dto: RequestLinkDto) {
    const guardian = await this.prisma.user.findUnique({ where: { id: guardianId } });
    if (guardian?.role !== Role.RELATIVE) {
      throw new ForbiddenException('Только RELATIVE может создавать связки');
    }

    const dependent = await this.prisma.user.findUnique({ where: { email: dto.dependentEmail } });
    if (!dependent) throw new NotFoundException('Пользователь с таким email не найден');
    if (dependent.id === guardianId) throw new BadRequestException('Нельзя создать связку с собой');

    // Проверяем что связки ещё нет
    const exists = await this.prisma.relativeLink.findUnique({
      where: { guardianId_dependentId: { guardianId, dependentId: dependent.id } },
    });
    if (exists) throw new BadRequestException('Запрос уже отправлен');

    return this.prisma.relativeLink.create({
      data: {
        guardianId,
        dependentId: dependent.id,
        label:       dto.label ?? null,
        isAccepted:  false,
      },
    });
  }

  // Пользователь принимает запрос
  async acceptLink(userId: string, linkId: string) {
    const link = await this.prisma.relativeLink.findUnique({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Связка не найдена');
    if (link.dependentId !== userId) throw new ForbiddenException('Нет доступа');
    if (link.isAccepted) throw new BadRequestException('Уже принято');

    return this.prisma.relativeLink.update({
      where: { id: linkId },
      data:  { isAccepted: true },
    });
  }

  // Посмотреть свои связки
  async getMyLinks(userId: string) {
    const [asGuardian, asDependent] = await Promise.all([
      this.prisma.relativeLink.findMany({
        where: { guardianId: userId },
        include: { dependent: { include: { profile: true }, omit: { passwordHash: true } } },
      }),
      this.prisma.relativeLink.findMany({
        where: { dependentId: userId },
        include: { guardian: { include: { profile: true }, omit: { passwordHash: true } } },
      }),
    ]);
    return { asGuardian, asDependent };
  }

  // Удалить связку
  async removeLink(userId: string, linkId: string) {
    const link = await this.prisma.relativeLink.findUnique({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Связка не найдена');
    if (link.guardianId !== userId && link.dependentId !== userId) {
      throw new ForbiddenException('Нет доступа');
    }
    await this.prisma.relativeLink.delete({ where: { id: linkId } });
    return { message: 'Связка удалена' };
  }

  // ── Обновить геолокацию ───────────────────────────────────────────────────
  async updateLocation(userId: string, lat: number, lon: number) {
    await this.prisma.userProfile.upsert({
      where:  { userId },
      update: { lat, lon },
      create: { userId, firstName: '', lastName: '', lat, lon },
    });
    await this.invalidatePublicCache(userId);
    return { lat, lon, message: 'Геолокация обновлена' };
  }

  // ── Мои лайкнутые новости ─────────────────────────────────────────────────
  async getLikedNews(userId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.newsLike.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        include: {
          news: {
            select: {
              id: true, titleRu: true, imageUrl: true,
              publishedAt: true, likesCount: true, commentsCount: true,
            },
          },
        },
      }),
      this.prisma.newsLike.count({ where: { userId } }),
    ]);
    return { items: items.map(l => l.news), total };
  }

  // ── Мои лайкнутые гайды ───────────────────────────────────────────────────
  async getLikedGuides(userId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.guideLike.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        include: {
          guide: {
            select: {
              id: true, titleRu: true, category: true,
              tags: true, likesCount: true,
            },
          },
        },
      }),
      this.prisma.guideLike.count({ where: { userId } }),
    ]);
    return { items: items.map(l => l.guide), total };
  }

  // ── Деактивировать аккаунт ────────────────────────────────────────────────
  async deactivate(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    await this.invalidatePublicCache(userId);
    return { message: 'Аккаунт деактивирован' };
  }

  // ── Redis helpers ─────────────────────────────────────────────────────────
  private async setPublicCache(userId: string, data: any) {
    try {
      await this.redis.set(`public_profile:${userId}`, JSON.stringify(data), PUBLIC_CACHE_TTL);
    } catch {}
  }

  private async invalidatePublicCache(userId: string) {
    try {
      await this.redis.del(`public_profile:${userId}`);
    } catch {}
  }
}
