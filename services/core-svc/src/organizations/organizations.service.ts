import { OrgStatus } from '@prisma/client';

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

async nearby(params: { lat: number; lon: number; radius: number; verified?: boolean }) {
  const { lat, lon, radius, verified } = params;

  const where: any = {
    lat: { not: null },
    lon: { not: null },
  };
  if (verified) where.status = OrgStatus.VERIFIED;

  const orgs = await this.prisma.organization.findMany({
    where,
    take: 500,
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