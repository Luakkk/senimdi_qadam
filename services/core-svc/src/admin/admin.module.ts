import { Module } from '@nestjs/common';
import { AdminOrganizationsController } from './organizations/organizations.controller';
import { AdminOrganizationsService } from './organizations/organizations.service';

@Module({
  controllers: [AdminOrganizationsController],
  providers: [AdminOrganizationsService],
})
export class AdminModule {}