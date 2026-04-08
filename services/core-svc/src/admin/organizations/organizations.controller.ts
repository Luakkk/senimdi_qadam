import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrgCategory, OrgStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminOrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { VerifyOrganizationDto } from './dto/verify-organization.dto';

@ApiTags('admin / organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('admin/organizations')
export class AdminOrganizationsController {
  constructor(private readonly svc: AdminOrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Список всех организаций с фильтрами' })
  @ApiQuery({ name: 'status',   enum: OrgStatus,   required: false })
  @ApiQuery({ name: 'category', enum: OrgCategory, required: false })
  @ApiQuery({ name: 'q',        required: false, description: 'Поиск по названию' })
  @ApiQuery({ name: 'limit',    required: false })
  @ApiQuery({ name: 'offset',   required: false })
  findAll(
    @Query('status')   status?: OrgStatus,
    @Query('category') category?: OrgCategory,
    @Query('q')        q?: string,
    @Query('limit')    limit = '50',
    @Query('offset')   offset = '0',
  ) {
    return this.svc.findAll({ status, category, q, limit: +limit, offset: +offset });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детали организации' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать организацию' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать организацию' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Изменить статус верификации' })
  verify(@Param('id') id: string, @Body() dto: VerifyOrganizationDto) {
    return this.svc.verify(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить организацию (только ADMIN)' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Лог верификации организации' })
  logs(@Param('id') id: string) {
    return this.svc.logs(id);
  }
}
