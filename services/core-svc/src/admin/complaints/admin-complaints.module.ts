import { Module } from '@nestjs/common';
import { ComplaintsModule } from '../../complaints/complaints.module';
import { AdminComplaintsController } from './admin-complaints.controller';

@Module({
  imports: [ComplaintsModule],
  controllers: [AdminComplaintsController],
})
export class AdminComplaintsModule {}