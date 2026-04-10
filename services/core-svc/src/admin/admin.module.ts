import { Module } from '@nestjs/common';

import { AdminOrganizationsController } from './organizations/organizations.controller';
import { AdminOrganizationsService }   from './organizations/organizations.service';

import { AdminUsersController }        from './users/users.controller';
import { AdminUsersService }           from './users/users.service';

import { AdminNewsController }         from './news/news.controller';
import { AdminNewsService }            from './news/news.service';

import { AdminTicketsController }      from './tickets/admin-tickets.controller';
import { AdminComplaintsController }   from './complaints/admin-complaints.controller';

// Переиспользуем сервисы из основных модулей
import { TicketsService }              from '../tickets/tickets.service';
import { ComplaintsService }           from '../complaints/complaints.service';

@Module({
  controllers: [
    AdminOrganizationsController,
    AdminUsersController,
    AdminNewsController,
    AdminTicketsController,
    AdminComplaintsController,
  ],
  providers: [
    AdminOrganizationsService,
    AdminUsersService,
    AdminNewsService,
    // tickets и complaints — переиспользуем существующие сервисы
    TicketsService,
    ComplaintsService,
  ],
})
export class AdminModule {}
