import {
  Body, Controller, Get, Param, Patch, Post,
  Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Создать обращение в поддержку' })
  create(@Body() dto: CreateTicketDto, @Request() req: any) {
    return this.service.create(dto, req.user.sub);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Мои обращения' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listMy(
    @Request() req: any,
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.service.listMy(req.user.sub, Number(limit), Number(offset));
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Все обращения (ADMIN/MODERATOR)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listAll(
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.service.listAll(Number(limit), Number(offset));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Одно обращение (своё или ADMIN/MODERATOR)' })
  getOne(@Param('id') id: string, @Request() req: any) {
    return this.service.getById(id, req.user.sub, req.user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновить статус обращения (ADMIN/MODERATOR)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
