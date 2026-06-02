import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { OrgStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ListOrganizationsQuery } from './dto/list-organizations.query';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateOrgServiceDto } from './dto/create-org-service.dto';
import { UpdateOrgServiceDto } from './dto/update-org-service.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';

// TTL кэша: каталог — 5 минут, одна организация — 10 минут
const ORG_LIST_TTL = 300;
const ORG_ITEM_TTL = 600;

function toRad(x: number) {
  return (x * Math.PI) / 180;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ── Redis helpers ─────────────────────────────────────────────────────────

  private orgItemKey(id: string) { return `org:${id}`; }

  // Ключ списка включает все параметры запроса для точной инвалидации
  private orgListKey(q: ListOrganizationsQuery) {
    return `org:list:${JSON.stringify(q)}`;
  }

  /** Инвалидируем кэш конкретной организации.
   *  Список сбросить точечно сложно (много ключей), поэтому используем
   *  tag-based инвалидацию: ключ org:list:* в dev удаляем вручную.
   *  В prod при VERIFIED каталогах хватает TTL 5 минут.
   */
  private async invalidateOrgCache(id: string) {
    try {
      await this.redis.del(this.orgItemKey(id));
    } catch { /* не блокируем бизнес-логику если Redis недоступен */ }
  }

  // ─── SELF-REGISTRATION ────────────────────────────────────────────────────
  // Любой авторизованный пользователь может подать заявку на регистрацию
  // организации. Статус: PENDING — на рассмотрении у администратора.
  // Пользователь получает роль ORG_MANAGER автоматически.
  async register(userId: string, dto: RegisterOrganizationDto) {
    // Проверяем, нет ли уже организации у этого менеджера
    const existing = await this.prisma.organization.findFirst({ where: { managerId: userId } });
    if (existing) {
      throw new ConflictException('Вы уже подали заявку или управляете организацией');
    }

    const org = await this.prisma.organization.create({
      data: {
        nameRu:       dto.nameRu,
        nameKk:       dto.nameKk        ?? null,
        category:     dto.category      ?? 'OTHER',
        description:  dto.description   ?? null,
        address:      dto.address       ?? null,
        city:         dto.city          ?? 'Алматы',
        phone:        dto.phone         ?? null,
        email:        dto.email         ?? null,
        website:      dto.website       ?? null,
        instagram:    dto.instagram     ?? null,
        lat:          dto.lat           ?? null,
        lon:          dto.lon           ?? null,
        isAccessible: dto.isAccessible  ?? true,
        workingHours: dto.workingHours  ?? null,
        status:       OrgStatus.PENDING,
        managerId:    userId,
      },
    });

    // Повышаем роль пользователя до ORG_MANAGER
    await this.prisma.user.update({
      where: { id: userId },
      data:  { role: Role.ORG_MANAGER },
    });
    // Сбрасываем кэш контекста — иначе guard будет видеть старую роль USER до 5 мин.
    await this.redis.invalidateUserCtx(userId);

    return {
      message: 'Заявка принята. Администратор рассмотрит её в течение 3–5 рабочих дней.',
      organizationId: org.id,
      status: org.status,
    };
  }

  async list(q: ListOrganizationsQuery) {
    // Кэшируем ответ на 5 минут. Ключ включает все параметры запроса.
    // При поиске (q.q) кэш не используем — результаты слишком разнообразны.
    const useCache = !q.q;
    if (useCache) {
      try {
        const cached = await this.redis.get(this.orgListKey(q));
        if (cached) return JSON.parse(cached);
      } catch { /* продолжаем без кэша */ }
    }

    // По умолчанию показываем только верифицированные организации
    const where: any = { status: OrgStatus.VERIFIED };

    if (q.q)        where.nameRu    = { contains: q.q, mode: 'insensitive' };
    if (q.category) where.category  = q.category;
    if (q.city)     where.city      = q.city;

    const limit  = q.limit  ?? 50;
    const offset = q.offset ?? 0;

    // Запрашиваем items и total параллельно — один лишний COUNT экономит RTT
    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        take:    limit,
        skip:    offset,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    const response = { items, total, limit, offset };

    if (useCache) {
      try {
        await this.redis.set(this.orgListKey(q), JSON.stringify(response), ORG_LIST_TTL);
      } catch { /* некритично */ }
    }

    return response;
  }

  async getById(id: string) {
    // Кэш на 10 минут — инвалидируется при обновлении организации
    try {
      const cached = await this.redis.get(this.orgItemKey(id));
      if (cached) return JSON.parse(cached);
    } catch { /* продолжаем без кэша */ }

    const org = await this.prisma.organization.findUnique({ where: { id } });

    if (org) {
      try {
        await this.redis.set(this.orgItemKey(id), JSON.stringify(org), ORG_ITEM_TTL);
      } catch { /* некритично */ }
    }

    return org;
  }

  // ── Полнотекстовый поиск для AI-ассистента ───────────────────────────────
  // Использует pg_trgm GIN индекс (создан в migration 20260527000001).
  // Оператор % — trigram similarity >= threshold (default 0.3).
  // Сортировка по similarity(nameRu, query) DESC, затем по ratingAvg.
  // Prisma LIKE через contains НЕ использует GIN индекс — только $queryRaw.
  async search(params: { query: string; category?: string; limit?: number }) {
    const { query, category, limit = 10 } = params;

    type OrgRow = {
      nameRu: string;
      category: string;
      address: string | null;
      city: string;
      phone: string | null;
      website: string | null;
      description: string | null;
      ratingAvg: number;
      ratingCount: number;
      lat: number | null;
      lon: number | null;
    };

    // pg_trgm: % оператор проверяет similarity >= pg_trgm.similarity_threshold (0.3)
    // ILIKE '%query%' — дополнительный fallback для коротких (< 3 символов) строк.
    // Два варианта запроса: с фильтром по категории и без.
    const ilike = `%${query}%`;
    const orgs = category
      ? await this.prisma.$queryRaw<OrgRow[]>`
          SELECT
            "nameRu", category::text AS category, address, city,
            phone, website, description,
            "ratingAvg", "ratingCount", lat, lon
          FROM "Organization"
          WHERE status = 'VERIFIED'
            AND (
              "nameRu"    % ${query}
              OR "nameKk"    % ${query}
              OR description % ${query}
              OR address     % ${query}
              OR "nameRu"    ILIKE ${ilike}
              OR "nameKk"    ILIKE ${ilike}
              OR description ILIKE ${ilike}
              OR category::text = ${category}
            )
          ORDER BY
            GREATEST(
              similarity("nameRu", ${query}),
              COALESCE(similarity("nameKk", ${query}), 0)
            ) DESC,
            "ratingAvg" DESC
          LIMIT ${limit}
        `
      : await this.prisma.$queryRaw<OrgRow[]>`
          SELECT
            "nameRu", category::text AS category, address, city,
            phone, website, description,
            "ratingAvg", "ratingCount", lat, lon
          FROM "Organization"
          WHERE status = 'VERIFIED'
            AND (
              "nameRu"    % ${query}
              OR "nameKk"    % ${query}
              OR description % ${query}
              OR address     % ${query}
              OR "nameRu"    ILIKE ${ilike}
              OR "nameKk"    ILIKE ${ilike}
              OR description ILIKE ${ilike}
            )
          ORDER BY
            GREATEST(
              similarity("nameRu", ${query}),
              COALESCE(similarity("nameKk", ${query}), 0)
            ) DESC,
            "ratingAvg" DESC
          LIMIT ${limit}
        `;

    // Fallback: если pg_trgm ничего не нашёл — топ-5 по рейтингу
    if (orgs.length === 0) {
      return this.prisma.$queryRaw<OrgRow[]>`
        SELECT
          "nameRu", category::text AS category, address, city,
          phone, website, description,
          "ratingAvg", "ratingCount", lat, lon
        FROM "Organization"
        WHERE status = 'VERIFIED'
        ORDER BY "ratingAvg" DESC
        LIMIT 5
      `;
    }

    return orgs;
  }

  // ── Сохранить организацию ─────────────────────────────────────────────────
  async saveOrg(userId: string, orgId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Организация не найдена');

    await this.prisma.savedOrganization.upsert({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      update: {},
      create: { userId, organizationId: orgId },
    });
    return { saved: true, message: 'Организация сохранена' };
  }

  // ── Убрать из сохранённых ─────────────────────────────────────────────────
  async unsaveOrg(userId: string, orgId: string) {
    await this.prisma.savedOrganization.deleteMany({
      where: { userId, organizationId: orgId },
    });
    return { saved: false, message: 'Убрано из сохранённых' };
  }

  // ── Мои сохранённые организации ───────────────────────────────────────────
  async getSaved(userId: string, limit = 20, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.savedOrganization.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        include: {
          organization: {
            select: {
              id: true, nameRu: true, category: true,
              city: true, address: true, phone: true,
              ratingAvg: true, ratingCount: true, isAccessible: true,
            },
          },
        },
      }),
      this.prisma.savedOrganization.count({ where: { userId } }),
    ]);
    return { items: items.map(s => s.organization), total };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORG_MANAGER PORTAL
  // ═══════════════════════════════════════════════════════════════════════════

  // Возвращает организацию, управляемую данным менеджером
  private async requireManagedOrg(managerId: string) {
    const org = await this.prisma.organization.findFirst({ where: { managerId } });
    if (!org) throw new NotFoundException('У вас нет привязанной организации');
    return org;
  }

  // ── GET /organizations/mine ────────────────────────────────────────────────
  async getMine(managerId: string) {
    return this.requireManagedOrg(managerId);
  }

  // ── PATCH /organizations/mine ──────────────────────────────────────────────
  async updateMine(managerId: string, dto: UpdateOrganizationDto) {
    const org = await this.requireManagedOrg(managerId);
    const updated = await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        ...(dto.nameRu        !== undefined && { nameRu:        dto.nameRu }),
        ...(dto.nameKk        !== undefined && { nameKk:        dto.nameKk }),
        ...(dto.nameEn        !== undefined && { nameEn:        dto.nameEn }),
        ...(dto.description   !== undefined && { description:   dto.description }),
        ...(dto.address       !== undefined && { address:       dto.address }),
        ...(dto.city          !== undefined && { city:          dto.city }),
        ...(dto.phone         !== undefined && { phone:         dto.phone }),
        ...(dto.email         !== undefined && { email:         dto.email }),
        ...(dto.website       !== undefined && { website:       dto.website }),
        ...(dto.instagram     !== undefined && { instagram:     dto.instagram }),
        ...(dto.lat           !== undefined && { lat:           dto.lat }),
        ...(dto.lon           !== undefined && { lon:           dto.lon }),
        ...(dto.isAccessible  !== undefined && { isAccessible:  dto.isAccessible }),
        ...(dto.workingHours  !== undefined && { workingHours:  dto.workingHours }),
      },
    });
    // Инвалидируем кэш этой организации после обновления
    await this.invalidateOrgCache(org.id);
    return updated;
  }

  // ── GET /organizations/mine/services ──────────────────────────────────────
  async listMyServices(managerId: string) {
    const org = await this.requireManagedOrg(managerId);
    return this.prisma.orgService.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── POST /organizations/mine/services ─────────────────────────────────────
  async createMyService(managerId: string, dto: CreateOrgServiceDto) {
    const org = await this.requireManagedOrg(managerId);
    return this.prisma.orgService.create({
      data: {
        organizationId: org.id,
        nameRu:        dto.nameRu,
        nameKk:        dto.nameKk        ?? null,
        descriptionRu: dto.descriptionRu ?? null,
        price:         dto.price         ?? 0,
        isActive:      dto.isActive      ?? true,
      },
    });
  }

  // ── PATCH /organizations/mine/services/:serviceId ─────────────────────────
  async updateMyService(managerId: string, serviceId: string, dto: UpdateOrgServiceDto) {
    const org = await this.requireManagedOrg(managerId);
    const svc = await this.prisma.orgService.findUnique({ where: { id: serviceId } });
    if (!svc) throw new NotFoundException('Услуга не найдена');
    if (svc.organizationId !== org.id) throw new ForbiddenException('Нет доступа');

    return this.prisma.orgService.update({
      where: { id: serviceId },
      data: {
        ...(dto.nameRu        !== undefined && { nameRu:        dto.nameRu }),
        ...(dto.nameKk        !== undefined && { nameKk:        dto.nameKk }),
        ...(dto.descriptionRu !== undefined && { descriptionRu: dto.descriptionRu }),
        ...(dto.price         !== undefined && { price:         dto.price }),
        ...(dto.isActive      !== undefined && { isActive:      dto.isActive }),
      },
    });
  }

  // ── DELETE /organizations/mine/services/:serviceId ────────────────────────
  async deleteMyService(managerId: string, serviceId: string) {
    const org = await this.requireManagedOrg(managerId);
    const svc = await this.prisma.orgService.findUnique({ where: { id: serviceId } });
    if (!svc) throw new NotFoundException('Услуга не найдена');
    if (svc.organizationId !== org.id) throw new ForbiddenException('Нет доступа');

    await this.prisma.orgService.delete({ where: { id: serviceId } });
    return { message: 'Услуга удалена' };
  }

  // ── GET /organizations/mine/analytics ─────────────────────────────────────
  async getMyAnalytics(managerId: string) {
    const org = await this.requireManagedOrg(managerId);

    const [savedCount, reviewCount, ratingData, servicesCount] = await Promise.all([
      this.prisma.savedOrganization.count({ where: { organizationId: org.id } }),
      this.prisma.orgReview.count({ where: { organizationId: org.id } }),
      this.prisma.orgReview.aggregate({
        where: { organizationId: org.id },
        _avg: { rating: true },
        _min: { rating: true },
        _max: { rating: true },
      }),
      this.prisma.orgService.count({ where: { organizationId: org.id, isActive: true } }),
    ]);

    return {
      organizationId: org.id,
      nameRu:         org.nameRu,
      status:         org.status,
      savedByCount:   savedCount,
      reviews: {
        total:    reviewCount,
        avgRating: ratingData._avg.rating ?? 0,
        minRating: ratingData._min.rating ?? 0,
        maxRating: ratingData._max.rating ?? 0,
      },
      activeServicesCount: servicesCount,
    };
  }

  // ── GET /organizations/mine/saved-users ───────────────────────────────────
  // Кто сохранил мою организацию — потенциальные клиенты
  async getMySavedUsers(managerId: string, limit = 20, offset = 0) {
    const org = await this.requireManagedOrg(managerId);

    const [items, total] = await Promise.all([
      this.prisma.savedOrganization.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: { firstName: true, lastName: true, phone: true, city: true, disabilityType: true },
              },
            },
          },
        },
      }),
      this.prisma.savedOrganization.count({ where: { organizationId: org.id } }),
    ]);

    return { items: items.map(s => s.user), total };
  }

  async nearby(params: { lat: number; lon: number; radius: number; verified?: boolean }) {
    const { lat, lon, radius, verified } = params;

    // bbox prefilter (MVP — ускорение запроса)
    const latDelta = radius / 111_320;
    const lonDelta = radius / (111_320 * Math.cos(toRad(lat)));

    const where: any = {
      lat: { not: null, gte: lat - latDelta, lte: lat + latDelta },
      lon: { not: null, gte: lon - lonDelta, lte: lon + lonDelta },
    };
    if (verified) where.status = OrgStatus.VERIFIED;

    const orgs = await this.prisma.organization.findMany({
      where,
      take: 300,
      orderBy: { updatedAt: 'desc' },
    });

    return orgs
      .map((o) => ({
        ...o,
        distanceMeters: Math.round(haversineMeters(lat, lon, o.lat!, o.lon!)),
      }))
      .filter((o) => o.distanceMeters <= radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 30);
  }
}