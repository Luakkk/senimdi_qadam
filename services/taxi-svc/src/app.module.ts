import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { JwtStrategy, RolesGuard } from './auth/jwt-auth.guard';

import { BookingsController } from './bookings/bookings.controller';
import { BookingsService } from './bookings/bookings.service';

import { ManagerController } from './manager/manager.controller';
import { ManagerService } from './manager/manager.service';

import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';

import { DriversController } from './drivers/drivers.controller';
import { DriversService } from './drivers/drivers.service';

import { ManagerAuthController } from './manager-auth/manager-auth.controller';
import { ManagerAuthService } from './manager-auth/manager-auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    BookingsController,
    ManagerController,
    ChatController,
    DriversController,
    ManagerAuthController,
  ],
  providers: [
    JwtStrategy,
    RolesGuard,
    BookingsService,
    ManagerService,
    ChatService,
    DriversService,
    ManagerAuthService,
  ],
})
export class AppModule {}
