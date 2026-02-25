import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/admin.guard';
import { TicketsService } from '../../tickets/tickets.service';

@ApiTags('admin/tickets')
@ApiHeader({ name: 'x-admin-key', required: true })
@ApiHeader({ name: 'x-role', required: false, description: 'ADMIN' })
@UseGuards(AdminGuard)
@Controller('admin/tickets')
export class AdminTicketsController {
  constructor(private readonly service: TicketsService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Patch(':id')
  setStatus(@Param('id') id: string, @Body() body: { status: 'OPEN' | 'IN_PROGRESS' | 'DONE' }) {
    return this.service.setStatus(id, body.status);
  }
}