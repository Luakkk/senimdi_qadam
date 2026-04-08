import { Module } from '@nestjs/common';
import { AdminOrganizationsController } from './organizations/organizations.controller';
import { AdminOrganizationsService }   from './organizations/organizations.service';
import { AdminUsersController }        from './users/users.controller';
import { AdminUsersService }           from './users/users.service';
import { AdminNewsController }         from './news/news.controller';
import { AdminNewsService }            from './news/news.service';

@Module({
  controllers: [
    AdminOrganizationsController,
    AdminUsersController,
    AdminNewsController,
  ],
  providers: [
    AdminOrganizationsService,
    AdminUsersService,
    AdminNewsService,
  ],
})
export class AdminModule {}
