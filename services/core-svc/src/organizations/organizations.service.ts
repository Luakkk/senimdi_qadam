import { Injectable } from '@nestjs/common';
import { OrgStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListOrganizationsQuery } from './dto/list-organizations.query';

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
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListOrganizationsQuery) {
    const where: any = {};

    // nameRu (раньше было name — в схеме поле называется nameRu)
    if (q.q) where.nameRu = { contains: q.q, mode: 'insensitive' };

    // category (раньше было type)
    if (q.category) where.category = q.category;

    // city (раньше было district)
    if (q.city) where.city = q.city;

    if (q.verified === 'true') where.status = OrgStatus.VERIFIED;

    return this.prisma.organization.findMany({
      where,
      take: q.limit ?? 50,
      skip: q.offset ?? 0,
      orderBy: { updatedAt: 'desc' },
    });
  }

  getById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  // ── Полнотекстовый поиск для AI-ассистента ───────────────────────────────
  // Ищем по nameRu, description и address. Возвращаем lat/lon для расстояния.
  // Этот endpoint вызывает ai-svc через HTTP — НЕ напрямую к БД.
  async search(params: { query: string; category?: string; limit?: number }) {
    const { query, category, limit = 10 } = params;

    const textConditions: any[] = [
      { nameRu:       { contains: query, mode: 'insensitive' } },
      { description:  { contains: query, mode: 'insensitive' } },
      { address:      { contains: query, mode: 'insensitive' } },
    ];

    const where: any = {
      status: { in: ['VERIFIED', 'PENDING'] },
    };

    if (category) {
      // При указании категории: совпадение по категории ИЛИ по тексту
      where.OR = [{ category }, ...textConditions];
    } else {
      where.OR = textConditions;
    }

    const orgs = await this.prisma.organization.findMany({
      where,
      select: {
        nameRu:       true,
        category:     true,
        address:      true,
        city:         true,
        phone:        true,
        website:      true,
        description:  true,
        ratingAvg:    true,
        ratingCount:  true,
        lat:          true,
        lon:          true,
      },
      orderBy: { ratingAvg: 'desc' },
      take: limit,
    });

    // Fallback: если ничего не нашли — вернём топ-5 по рейтингу
    if (orgs.length === 0) {
      return this.prisma.organization.findMany({
        where: { status: { in: ['VERIFIED', 'PENDING'] } },
        select: {
          nameRu: true, category: true, address: true, city: true,
          phone: true, website: true, description: true,
          ratingAvg: true, ratingCount: true, lat: true, lon: true,
        },
        orderBy: { ratingAvg: 'desc' },
        take: 5,
      });
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