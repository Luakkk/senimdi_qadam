/**
 * Seed script for SenimdiQAdam core-svc database
 * Parses Каталог_организаций_CLEAN.xlsx and upserts organizations
 * Run: npx ts-node prisma/seed.ts
 */

import { PrismaClient, OrgCategory, OrgStatus, Role } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Column indices in the XLSX file (header at row index 2) ───────────────────
const COL = {
  NUMBER:   0,  // №
  TYPE:     1,  // Тип
  NAME:     2,  // Наименование организации
  DISTRICT: 3,  // Район
  ADDRESS:  4,  // Адрес
  PHONE:    5,  // Телефон
  EMAIL:    6,  // Email
  SERVICE:  7,  // Форма услуги
  CATEGORY: 8,  // Категория получателей
  DIRECTOR: 9,  // ФИО руководителя
  SOURCE:   10, // Источник
  ADDED:    11, // Доб. в БД?
  STATUS:   12, // Статус
};

// ── Map Russian type string → OrgCategory enum ────────────────────────────────
function mapCategory(typeStr: string): OrgCategory {
  const t = (typeStr ?? '').toLowerCase().trim();

  if (t.includes('медицин') || t.includes('клиник') || t.includes('больниц')) {
    return OrgCategory.MEDICAL;
  }
  if (t.includes('образован') || t.includes('школ') || t.includes('детск') || t.includes('учебн') || t.includes('кппк')) {
    return OrgCategory.EDUCATION;
  }
  if (t.includes('спорт') || t.includes('физкульт') || t.includes('реабилит')) {
    return OrgCategory.SPORT;
  }
  if (t.includes('культур') || t.includes('театр') || t.includes('музей') || t.includes('библиотек')) {
    return OrgCategory.CULTURE;
  }
  if (t.includes('нко') || t.includes('нпо') || t.includes('общественн') || t.includes('фонд') || t.includes('некоммерч')) {
    return OrgCategory.SOCIAL;
  }
  if (t.includes('государств') || t.includes('гос.') || t.includes('акимат') || t.includes('управлен') || t.includes('кгу')) {
    return OrgCategory.LEGAL;
  }
  if (t.includes('социальн') || t.includes('соц.') || t.includes('центр соц')) {
    return OrgCategory.SOCIAL;
  }

  return OrgCategory.OTHER;
}

// ── Normalize phone number string ─────────────────────────────────────────────
function normalizePhone(raw: any): string | undefined {
  if (!raw) return undefined;
  const s = String(raw).trim();
  if (!s || s === '-') return undefined;
  return s.replace(/\s+/g, ' ').trim();
}

// ── Normalize string cell ─────────────────────────────────────────────────────
function str(val: any): string | undefined {
  if (val === null || val === undefined) return undefined;
  const s = String(val).trim();
  return s === '' || s === '-' ? undefined : s;
}

// ── Build description from service form + recipient category ──────────────────
function buildDescription(service: any, category: any): string | undefined {
  const parts: string[] = [];
  const s = str(service);
  const c = str(category);
  if (s) parts.push(`Форма услуги: ${s}`);
  if (c) parts.push(`Категория получателей: ${c}`);
  return parts.length > 0 ? parts.join('. ') : undefined;
}

// ── Main seed function ────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting seed...');

  // ── 1. Locate XLSX file ───────────────────────────────────────────────────
  const xlsxPath = path.resolve(
    __dirname,
    '../../../../data/Каталог_организаций_CLEAN.xlsx',
  );

  console.log(`📂 Reading XLSX: ${xlsxPath}`);
  const workbook = XLSX.readFile(xlsxPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of arrays (raw rows)
  const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Header is at row index 2 → data starts at index 3
  const dataRows = rawRows.slice(3).filter(row => row && row[COL.NAME]);

  console.log(`📋 Found ${dataRows.length} organization rows`);

  // ── 2. Upsert organizations ───────────────────────────────────────────────
  let created = 0;
  let updated = 0;

  for (const row of dataRows) {
    const nameRu = str(row[COL.NAME]);
    if (!nameRu) continue;

    const category    = mapCategory(str(row[COL.TYPE]) ?? '');
    const address     = str(row[COL.ADDRESS]);
    const phone       = normalizePhone(row[COL.PHONE]);
    const email       = str(row[COL.EMAIL])?.toLowerCase();
    const description = buildDescription(row[COL.SERVICE], row[COL.CATEGORY]);
    const district    = str(row[COL.DISTRICT]);

    // Combine district + address into addressRu
    const fullAddress = [district, address].filter(Boolean).join(', ') || undefined;

    try {
      const existing = await prisma.organization.findFirst({
        where: { nameRu },
        select: { id: true },
      });

      if (existing) {
        await prisma.organization.update({
          where: { id: existing.id },
          data: {
            category,
            address:     fullAddress,
            phone,
            email,
            description,
            status:      OrgStatus.VERIFIED,
          },
        });
        updated++;
      } else {
        await prisma.organization.create({
          data: {
            nameRu,
            category,
            address:     fullAddress,
            phone,
            email,
            description,
            status:      OrgStatus.VERIFIED,
          },
        });
        created++;
      }
    } catch (err) {
      console.warn(`⚠️  Skipping "${nameRu}":`, (err as Error).message);
    }
  }

  console.log(`✅ Organizations: ${created} created, ${updated} updated`);

  // ── 3. Create default admin user if not present ───────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@senimdi.kz';
  const adminPass  = process.env.ADMIN_PASSWORD ?? 'Admin@123456!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPass, 12);
    await prisma.user.create({
      data: {
        email:        adminEmail,
        passwordHash: hash,
        role:         Role.ADMIN,
        isVerified:   true,
        profile: {
          create: {
            firstName: 'System',
            lastName:  'Administrator',
          },
        },
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  console.log('🎉 Seed completed!');
}

main()
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
