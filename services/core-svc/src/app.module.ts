import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LanguageMiddleware } from './common/middleware/language.middleware';
import { LanguageInterceptor } from './common/interceptors/language.interceptor';

import { PrismaModule }         from './prisma/prisma.module';
import { RedisModule }          from './redis/redis.module';
import { MinioModule }          from './minio/minio.module';
import { FcmModule }            from './fcm/fcm.module';
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
import { InternalModule }       from './internal/internal.module';
import { NotificationsModule }  from './notifications/notifications.module';

@Module({
  imports: [
    // ── Конфиг (isGlobal — доступен во всех модулях без импорта)
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Rate limiting (100 запросов за 60 секунд с одного IP)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // ── Инфраструктура
    PrismaModule,
    RedisModule,
    MinioModule,
    FcmModule,

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

    // ── Внутренние service-to-service эндпоинты (защищены ADMIN_KEY)
    InternalModule,

    // ── История уведомлений пользователя
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD,       useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LanguageInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
}
