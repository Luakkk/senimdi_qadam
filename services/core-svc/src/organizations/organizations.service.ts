import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrgStatus } from '@prisma/client';
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

    if (q.q) where.name = { contains: q.q, mode: 'insensitive' };
    if (q.type) where.type = q.type;
    if (q.district) where.district = q.district;
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

  async nearby(params: { lat: number; lon: number; radius: number; verified?: boolean }) {
    const { lat, lon, radius, verified } = params;

    // bbox prefilter (MVP ускорение)
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