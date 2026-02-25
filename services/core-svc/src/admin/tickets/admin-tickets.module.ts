import { Module } from '@nestjs/common';
import { TicketsModule } from '../../tickets/tickets.module';
import { AdminTicketsController } from './admin-tickets.controller';

@Module({
  imports: [TicketsModule],
  controllers: [AdminTicketsController],
})
export class AdminTicketsModule {}