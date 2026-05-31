import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { FcmModule } from './fcm/fcm.module';
import { GatewaysModule } from './gateways/gateways.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { RolesGuard } from './auth/roles.guard';

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

import { RecurringController } from './recurring/recurring.controller';
import { RecurringService } from './recurring/recurring.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    FcmModule,
    GatewaysModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    // ВАЖНО: RecurringController (роуты bookings/recurring) должен идти ДО
    // BookingsController, иначе GET bookings/:id перехватит /bookings/recurring → 404.
    RecurringController,
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
    RecurringService,
  ],
})
export class AppModule {}
