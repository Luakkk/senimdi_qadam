import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { NewsModule } from './news/news.module';
import { TicketsModule } from './tickets/tickets.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { ReviewsModule } from './reviews/reviews.module';
import { GuidesModule } from './guides/guides.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    // ── Конфиг (isGlobal — доступен во всех модулях без импорта)
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Rate limiting (highload: 100 запросов за 60 секунд с одного IP)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,   // окно в миллисекундах (60 сек)
        limit: 100,   // макс запросов за это окно
      },
    ]),

    // ── БД
    PrismaModule,
    RedisModule,

    // ── Бизнес-модули
    HealthModule,
    AuthModule,
    OrganizationsModule,
    NewsModule,
    TicketsModule,
    ComplaintsModule,
    ReviewsModule,
    GuidesModule,
    ProfileModule,
  ],
  providers: [
    // ── Применяем ThrottlerGuard глобально (highload)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
