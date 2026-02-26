import { PrismaClient, OrgStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.verificationLog.deleteMany({});
  await prisma.organization.deleteMany({});

  const items: Prisma.OrganizationCreateManyInput[] = [
    {
      name: 'КГУ "Центр социальных услуг Демеу"',
      type: 'social',
      city: 'Almaty',
      district: 'Bostandyk',
      address: 'Абиш Кекилбайулы 121',
      phone: '',
      website: '',
      description: 'Стационар: лица с инвалидностью 18+ с психоневрологическими заболеваниями',
      status: OrgStatus.VERIFIED,
      lat: 43.238949,
      lon: 76.889709,
      accessRamp: true,
      wheelchair: true,
    },
    {
      name: 'КГУ "Центр социальных услуг Алатау"',
      type: 'social',
      city: 'Almaty',
      district: 'Medeu',
      address: 'Достык 103/12',
      description: 'Стационар: инвалиды 18+ с психоневрологическими заболеваниями',
      status: OrgStatus.PENDING,
      lat: 43.2466,
      lon: 76.8453,
      onlineConsult: false,
    },
    {
      name: 'КППК "Aq Alem"',
      type: 'education',
      city: 'Almaty',
      district: 'Almaly',
      address: 'мкр Нуркент, 5/26',
      phone: '87078076605',
      description: 'Кабинет психолого-педагогической коррекции',
      status: OrgStatus.VERIFIED,
      lat: 43.2567,
      lon: 76.9286,
      onlineConsult: true,
    },
  ];

  while (items.length < 20) {
    const base = items[items.length % 3];

    items.push({
      ...base,
      name: `${base.name} #${items.length + 1}`,
      status: items.length % 3 === 0 ? OrgStatus.PENDING : OrgStatus.VERIFIED,
      lat: (base.lat ?? 43.24) + (Math.random() - 0.5) * 0.06,
      lon: (base.lon ?? 76.89) + (Math.random() - 0.5) * 0.06,
    });
  }

  await prisma.organization.createMany({ data: items });
  console.log(`Seed OK: ${items.length} organizations`);
}