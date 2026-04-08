import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role, TicketStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TicketsService } from '../../tickets/tickets.service';

@ApiTags('Admin / Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('admin/tickets')
export class AdminTicketsController {
  constructor(private readonly service: TicketsService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  list(
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    return this.service.listAll(+limit, +offset);
  }

  @Patch(':id')
  @ApiQuery({ name: 'status', enum: TicketStatus })
  setStatus(
    @Param('id') id: string,
    @Body() body: { status: TicketStatus },
  ) {
    return this.service.updateStatus(id, body.status);
  }
}
