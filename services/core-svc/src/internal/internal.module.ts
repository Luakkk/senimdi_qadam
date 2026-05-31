import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports:     [NotificationsModule],
  controllers: [InternalController],
})
export class InternalModule {}
