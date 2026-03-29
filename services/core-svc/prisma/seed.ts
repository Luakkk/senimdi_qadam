import { PrismaClient, OrgStatus, OrgCategory, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.verificationLog.deleteMany({});
  await prisma.organization.deleteMany({});

  const base = [
    {
      nameRu: 'КГУ "Центр социальных услуг Демеу"',
      category: OrgCategory.SOCIAL,
      city: 'Алматы',
      address: 'Абиш Кекилбайулы 121',
      phone: '',
      website: '',
      description: 'Стационар: лица с инвалидностью 18+ с психоневрологическими заболеваниями',
      status: OrgStatus.VERIFIED,
      isAccessible: true,
      lat: 43.238949,
      lon: 76.889709,
    },
    {
      nameRu: 'КГУ "Центр социальных услуг Алатау"',
      category: OrgCategory.SOCIAL,
      city: 'Алматы',
      address: 'Достык 103/12',
      description: 'Стационар: инвалиды 18+ с психоневрологическими заболеваниями',
      status: OrgStatus.PENDING,
      lat: 43.2466,
      lon: 76.8453,
    },
    {
      nameRu: 'КППК "Aq Alem"',
      category: OrgCategory.EDUCATION,
      city: 'Алматы',
      address: 'мкр Нуркент, 5/26',
      phone: '87078076605',
      description: 'Кабинет психолого-педагогической коррекции',
      status: OrgStatus.VERIFIED,
      lat: 43.2567,
      lon: 76.9286,
    },
  ];

  const items: Prisma.OrganizationCreateManyInput[] = [...base];

  while (items.length < 20) {
    const src = base[items.length % base.length];
    items.push({
      ...src,
      nameRu: `${src.nameRu} #${items.length + 1}`,
      status: items.length % 3 === 0 ? OrgStatus.PENDING : OrgStatus.VERIFIED,
      lat: (src.lat ?? 43.24) + (Math.random() - 0.5) * 0.06,
      lon: (src.lon ?? 76.89) + (Math.random() - 0.5) * 0.06,
    });
  }

  await prisma.organization.createMany({ data: items });
  console.log(`Seed OK: ${items.length} organizations`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
