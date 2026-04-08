import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NewsStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminNewsService } from './news.service';
import { ModerateNewsDto } from './dto/moderate-news.dto';

@ApiTags('admin / news')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly svc: AdminNewsService) {}

  @Get()
  @ApiOperation({ summary: 'Все новости (включая DRAFT, PENDING, REJECTED)' })
  @ApiQuery({ name: 'status', enum: NewsStatus, required: false })
  @ApiQuery({ name: 'q',      required: false })
  @ApiQuery({ name: 'limit',  required: false })
  @ApiQuery({ name: 'offset', required: false })
  findAll(
    @Query('status') status?: NewsStatus,
    @Query('q')      q?: string,
    @Query('limit')  limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.svc.findAll({ status, q, limit: +limit, offset: +offset });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Статистика новостей по статусам' })
  stats() {
    return this.svc.stats();
  }

  @Patch(':id/moderate')
  @ApiOperation({ summary: 'Модерация: опубликовать или отклонить новость' })
  moderate(@Param('id') id: string, @Body() dto: ModerateNewsDto) {
    return this.svc.moderate(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить новость (только ADMIN)' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
