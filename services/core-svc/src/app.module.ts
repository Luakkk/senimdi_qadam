import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { PrismaModule }         from './prisma/prisma.module';
import { RedisModule }          from './redis/redis.module';
import { HealthModule }         from './health/health.module';
import { AuthModule }           from './auth/auth.module';
import { OrganizationsModule }  from './organizations/organizations.module';
import { NewsModule }           from './news/news.module';
import { TicketsModule }        from './tickets/tickets.module';
import { ComplaintsModule }     from './complaints/complaints.module';
import { ReviewsModule }        from './reviews/reviews.module';
import { GuidesModule }         from './guides/guides.module';
import { ProfileModule }        from './profile/profile.module';
import { AdminModule }          from './admin/admin.module';

@Module({
  imports: [
    // ── Конфиг (isGlobal — доступен во всех модулях без импорта)
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Rate limiting (100 запросов за 60 секунд с одного IP)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // ── Инфраструктура
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

    // ── Панель администратора (JWT + ADMIN/MODERATOR)
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
