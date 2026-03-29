/**
 * Seed: тестовые новости для SenimdiQAdam
 * Запуск: npx ts-node prisma/seed-news.ts
 */
import { PrismaClient, NewsStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Создаём тестового модератора если нет
  let moderator = await prisma.user.findFirst({
    where: { email: 'moderator@senimdi.kz' },
  });

  if (!moderator) {
    moderator = await prisma.user.create({
      data: {
        email: 'moderator@senimdi.kz',
        passwordHash: await bcrypt.hash('Moderator123!', 12),
        role: 'MODERATOR',
        isVerified: true,
      },
    });
    console.log('✅ Модератор создан:', moderator.email);
  }

  // Создаём тестового admin если нет
  let admin = await prisma.user.findFirst({
    where: { email: 'admin@senimdi.kz' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@senimdi.kz',
        passwordHash: await bcrypt.hash('Admin123!', 12),
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('✅ Админ создан:', admin.email);
  }

  // Удаляем старые seed новости
  await prisma.news.deleteMany({
    where: { authorId: { in: [moderator.id, admin.id] } },
  });

  const now = new Date();
  const news = [
    {
      titleRu: 'В Алматы открылся новый центр реабилитации для людей с нарушениями опорно-двигательного аппарата',
      titleKk: 'Алматыда тірек-қимыл бұзылысы бар адамдарға арналған жаңа оңалту орталығы ашылды',
      bodyRu: `В микрорайоне Алатау открылся современный реабилитационный центр «Жаңа Өмір», оснащённый новейшим оборудованием для физиотерапии, эрготерапии и логопедии. Центр рассчитан на 150 посетителей в день и предоставляет услуги бесплатно для граждан с инвалидностью I и II группы при наличии направления от МСЭ.

Центр оборудован пандусами, подъёмниками и адаптированными санузлами. Запись через портал egov.kz или по телефону.`,
      bodyKk: `Алатау шағынауданында заманауи «Жаңа Өмір» оңалту орталығы ашылды. Орталық физиотерапия, эрготерапия және логопедия бойынша жабдықтармен жарақталған.`,
      imageUrl: null,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
    },
    {
      titleRu: 'Казахстан ратифицировал обновлённые стандарты доступности общественного транспорта',
      titleKk: 'Қазақстан қоғамдық көліктің қолжетімділік стандарттарын бекітті',
      bodyRu: `Мажилис Парламента РК принял поправки в Закон «О транспорте», обязывающие все автобусные парки страны обеспечить не менее 30% низкопольных автобусов к 2027 году. В Алматы этот показатель уже составляет 18%.

Поправки также обязывают устанавливать звуковые объявления остановок и тактильные указатели на остановочных комплексах. Финансирование предусмотрено из республиканского бюджета.`,
      bodyKk: null,
      imageUrl: null,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      authorId: moderator.id,
    },
    {
      titleRu: 'Паралимпийцы Казахстана завоевали 7 медалей на международных соревнованиях в Дубае',
      titleKk: 'Қазақстанның параолимпиадашылары Дубайдағы халықаралық жарыстарда 7 медаль жеңіп алды',
      bodyRu: `Сборная Казахстана по паралимпийским видам спорта вернулась с международного турнира Para Athletics Grand Prix в Дубае с 7 медалями: 3 золотых, 2 серебряных и 2 бронзовых.

Особо отличилась Айгуль Маканова из Алматы в толкании ядра (класс F54) — она установила новый рекорд Азии. Министр спорта поздравил спортсменов и анонсировал увеличение стипендий паралимпийцам.`,
      bodyKk: null,
      imageUrl: null,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
    },
    {
      titleRu: 'Новое мобильное приложение помогает незрячим жителям Алматы ориентироваться в городе',
      titleKk: null,
      bodyRu: `Казахстанский стартап NaviBlind выпустил приложение для iOS и Android, которое озвучивает маршруты в реальном времени с учётом препятствий на тротуарах, светофоров с тактильными кнопками и расположения пандусов.

Приложение использует данные городской геоинформационной системы и отзывы пользователей. На данный момент оно работает в Алматы и Астане, до конца года планируется запуск в Шымкенте. Скачать бесплатно в App Store и Google Play.`,
      bodyKk: null,
      imageUrl: null,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      authorId: moderator.id,
    },
    {
      titleRu: 'Социальные выплаты по инвалидности вырастут на 8.5% с 1 июля 2026 года',
      titleKk: 'Мүгедектік бойынша әлеуметтік төлемдер 2026 жылғы 1 шілдеден 8,5%-ға өседі',
      bodyRu: `Министерство труда и социальной защиты населения РК объявило об индексации социальных выплат по инвалидности. С 1 июля 2026 года выплаты вырастут на 8.5%, что соответствует уровню инфляции за 2025 год.

Средний размер выплаты для инвалидов I группы составит 95 000 тенге в месяц, II группы — 68 000 тенге, III группы — 42 000 тенге. Перерасчёт будет произведён автоматически, обращаться в ЦОН не нужно.`,
      bodyKk: null,
      imageUrl: null,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
    },
    {
      titleRu: 'Тест: новость на модерации (не видна публично)',
      titleKk: null,
      bodyRu: 'Это тестовая новость со статусом PENDING — не отображается на сайте.',
      bodyKk: null,
      imageUrl: null,
      status: NewsStatus.PENDING,
      publishedAt: null,
      authorId: moderator.id,
    },
  ];

  for (const item of news) {
    await prisma.news.create({ data: item });
  }

  console.log(`✅ Создано ${news.length} новостей (${news.filter(n => n.status === NewsStatus.PUBLISHED).length} опубликовано, 1 на модерации)`);
  console.log('\n🔑 Тестовые аккаунты:');
  console.log('   Модератор: moderator@senimdi.kz / Moderator123!');
  console.log('   Админ:     admin@senimdi.kz / Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
