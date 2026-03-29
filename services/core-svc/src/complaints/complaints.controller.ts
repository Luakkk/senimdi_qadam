import {
  Body, Controller, Get, Param, Patch, Post,
  Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ComplaintStatus, Role } from '@prisma/client';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly service: ComplaintsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Подать жалобу' })
  create(@Body() dto: CreateComplaintDto, @Request() req: any) {
    return this.service.create(dto, req.user.sub);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Мои жалобы' })
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
  @ApiOperation({ summary: 'Все жалобы (ADMIN/MODERATOR)' })
  @ApiQuery({ name: 'status', required: false, enum: ComplaintStatus })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listAll(
    @Query('status') status?: ComplaintStatus,
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.service.listAll(status, Number(limit), Number(offset));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Одна жалоба (своя или ADMIN/MODERATOR)' })
  getOne(@Param('id') id: string, @Request() req: any) {
    return this.service.getById(id, req.user.sub, req.user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновить статус жалобы (ADMIN/MODERATOR)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateComplaintStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
