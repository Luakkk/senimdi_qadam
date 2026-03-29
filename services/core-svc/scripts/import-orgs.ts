/**
 * SenimdiQAdam — Импорт организаций из Excel
 * Запуск: npx ts-node scripts/import-orgs.ts
 */

import * as XLSX from 'xlsx';
import * as path from 'path';
import { PrismaClient, OrgCategory, OrgStatus } from '@prisma/client';

const prisma = new PrismaClient();

const EXCEL_PATH = path.resolve(__dirname, '../../../Каталог_организаций_CLEAN.xlsx');

function mapCategory(raw: string | undefined): OrgCategory {
  if (!raw) return OrgCategory.OTHER;
  const val = raw.toString().toLowerCase().trim();
  if (val.includes('реабилит'))                                                             return OrgCategory.REHABILITATION;
  if (val.includes('образован') || val.includes('школ') || val.includes('учебн') ||
      val.includes('обучен') || val.includes('колледж') || val.includes('академи'))        return OrgCategory.EDUCATION;
  if (val.includes('медицин') || val.includes('клиник') || val.includes('больниц') ||
      val.includes('поликлин') || val.includes('психиатр') || val.includes('лечебн'))      return OrgCategory.MEDICAL;
  if (val.includes('юридич') || val.includes('правов') || val.includes('адвокат'))        return OrgCategory.LEGAL;
  if (val.includes('социал') || val.includes('демеу') || val.includes('ку "цент') ||
      val.includes('кгу') || val.includes('үміт') || val.includes('надежд'))               return OrgCategory.SOCIAL;
  if (val.includes('спорт') || val.includes('физкульт') || val.includes('паралимп'))      return OrgCategory.SPORT;
  if (val.includes('культур') || val.includes('творч') || val.includes('искусств'))       return OrgCategory.CULTURE;
  if (val.includes('занятост') || val.includes('трудоустр') || val.includes('центр занят')) return OrgCategory.EMPLOYMENT;
  return OrgCategory.OTHER;
}

async function main() {
  // ── Читаем Excel без авто-заголовков, чтобы увидеть все строки как есть
  console.log('📂 Читаю файл:', EXCEL_PATH);
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // header: 1 — все строки как массивы (без автоматического определения заголовков)
  const allRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  console.log(`\n📊 Всего строк в файле: ${allRows.length}`);
  console.log('\n=== Первые 5 строк (сырые данные) ===');
  allRows.slice(0, 5).forEach((row, i) => console.log(`Строка ${i + 1}:`, row));

  // ── Находим строку с заголовками (ищем строку где есть "Название" или "№")
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(10, allRows.length); i++) {
    const row = allRows[i];
    const rowStr = row.join('|').toLowerCase();
    if (
      rowStr.includes('название') ||
      rowStr.includes('наименование') ||
      rowStr.includes('name') ||
      (rowStr.includes('№') && rowStr.includes('категор'))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.log('\n⚠️  Не нашёл строку с заголовками автоматически.');
    console.log('    Показываю строки 1-7 для ручного определения:');
    allRows.slice(0, 7).forEach((row, i) => console.log(`  [${i}]`, row));
    console.log('\n    Установи headerRowIndex вручную в скрипте и запусти снова.');
    process.exit(0);
  }

  const headers: string[] = allRows[headerRowIndex].map((h: any) => h?.toString().trim() || '');
  console.log(`\n✅ Заголовки найдены в строке ${headerRowIndex + 1}:`);
  headers.forEach((h, i) => console.log(`  [${i}] "${h}"`));

  // ── Данные — строки после заголовка
  const dataRows = allRows.slice(headerRowIndex + 1);
  console.log(`\n📊 Строк с данными: ${dataRows.length}`);
  console.log('\n🔍 Первая строка данных:');
  const firstData: Record<string, any> = {};
  headers.forEach((h, i) => { firstData[h || `col_${i}`] = dataRows[0]?.[i]; });
  console.log(firstData);

  // ── Удаляем старые записи (неверный импорт с OTHER)
  console.log('\n🗑️  Очищаю старые записи...');
  await prisma.organization.deleteMany({});
  console.log('   Очищено.');

  // ── Хелпер: найти значение колонки по ключевым словам
  function findVal(row: any[], ...keys: string[]): string {
    for (const key of keys) {
      const idx = headers.findIndex(h => h.toLowerCase().includes(key.toLowerCase()));
      if (idx !== -1 && row[idx] !== undefined && row[idx] !== '') {
        return row[idx].toString().trim();
      }
    }
    return '';
  }

  // ── Импорт
  console.log('\n⏳ Начинаю импорт...');
  let created = 0;
  let skipped = 0;

  for (const row of dataRows) {
    // Пропускаем пустые строки
    if (!row || row.every((c: any) => c === '' || c === null || c === undefined)) {
      skipped++;
      continue;
    }

    const nameRu = findVal(row, 'название', 'наименование', 'name', 'организац');
    if (!nameRu) { skipped++; continue; }

    // Определяем категорию по НАЗВАНИЮ организации (не по "Категория получателей"!)
    const categoryRaw = nameRu + ' ' + findVal(row, 'форма услуги', 'форма');
    const city        = findVal(row, 'город', 'city') || 'Алматы';
    const address     = findVal(row, 'адрес', 'address');
    const phone       = findVal(row, 'телефон', 'phone', 'тел');
    const website     = findVal(row, 'сайт', 'website', 'url', 'web');
    const description = findVal(row, 'описание', 'description', 'деятельност', 'услуг', 'направлен');
    const latStr      = findVal(row, 'lat', 'широт', 'latitude');
    const lonStr      = findVal(row, 'lon', 'lng', 'долгот', 'longitude');
    const lat         = latStr ? parseFloat(latStr) : null;
    const lon         = lonStr ? parseFloat(lonStr) : null;

    try {
      await prisma.organization.create({
        data: {
          nameRu,
          category:    mapCategory(categoryRaw),
          status:      OrgStatus.VERIFIED,
          city:        city || 'Алматы',
          address:     address  || null,
          phone:       phone    || null,
          website:     website  || null,
          description: description || null,
          lat:         lat && !isNaN(lat) ? lat : null,
          lon:         lon && !isNaN(lon) ? lon : null,
          isAccessible: true,
        },
      });
      created++;
      process.stdout.write(`\r  ✅ Создано: ${created} | ⏭ Пропущено: ${skipped}`);
    } catch (e: any) {
      if (e.code === 'P2002') { skipped++; }
      else { console.error(`\n❌ Ошибка для "${nameRu}":`, e.message); }
    }
  }

  console.log(`\n\n✅ Импорт завершён!`);
  console.log(`   Создано:   ${created}`);
  console.log(`   Пропущено: ${skipped}`);

  const total = await prisma.organization.count();
  const byCat = await prisma.organization.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  console.log(`\n📊 Всего в БД: ${total} организаций`);
  console.log('   По категориям:');
  byCat.forEach(c => console.log(`   ${c.category}: ${c._count.id}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
