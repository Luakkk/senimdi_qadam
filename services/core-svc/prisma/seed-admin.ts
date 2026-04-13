/**
 * Создаёт администратора для AdminJS панели
 * Запуск: npx ts-node -r dotenv/config prisma/seed-admin.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email    = 'admin@senimdi.kz';
  const password = 'Admin2026!';
  const hash     = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Если юзер есть — просто повышаем до ADMIN и обновляем пароль
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', passwordHash: hash, isActive: true },
    });
    console.log('✅ Администратор обновлён:', email);
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'ADMIN',
        isVerified: true,
        isActive:   true,
        profile: {
          create: {
            firstName: 'Алуа',
            lastName:  'Сенімді',
          },
        },
      },
    });
    console.log('✅ Администратор создан:', email);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Логин:   admin@senimdi.kz');
  console.log('  Пароль:  Admin2026!');
  console.log('  Панель:  http://localhost:3000/admin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Ошибка:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
