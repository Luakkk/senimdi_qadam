import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AdminModule } from './admin/admin.module';

import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { TicketsModule } from './tickets/tickets.module';
import { AdminComplaintsModule } from './admin/complaints/admin-complaints.module';
import { AdminTicketsModule } from './admin/tickets/admin-tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    PrismaModule,
    HealthModule,
    OrganizationsModule,

    // публичные фичи “50%”
    AuthModule,
    NewsModule,
    ComplaintsModule,
    TicketsModule,

    // админские ручки “50%”
    AdminModule,
    AdminComplaintsModule,
    AdminTicketsModule,
  ],
})
export class AppModule {}