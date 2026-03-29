import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import { AdminGuard } from '../../auth/admin.guard';
import { TicketsService } from '../../tickets/tickets.service';

@ApiTags('admin/tickets')
@ApiHeader({ name: 'x-admin-key', required: true })
@UseGuards(AdminGuard)
@Controller('admin/tickets')
export class AdminTicketsController {
  constructor(private readonly service: TicketsService) {}

  @Get()
  list() {
    return this.service.listAll(100, 0);
  }

  // TicketStatus: OPEN | IN_PROGRESS | RESOLVED | CLOSED
  @Patch(':id')
  setStatus(@Param('id') id: string, @Body() body: { status: TicketStatus }) {
    return this.service.updateStatus(id, body.status);
  }
}
