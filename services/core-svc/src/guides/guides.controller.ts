import {
  Body, Controller, Get, Param, Patch,
  Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GuidesService } from './guides.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Guides')
@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  @ApiOperation({ summary: 'Список опубликованных гайдов (публичный)' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'limit',    required: false, type: Number })
  @ApiQuery({ name: 'offset',   required: false, type: Number })
  list(
    @Query('category') category?: string,
    @Query('limit')    limit = 20,
    @Query('offset')   offset = 0,
  ) {
    return this.guidesService.list(category, Number(limit), Number(offset));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детальная страница гайда (публичный)' })
  getById(@Param('id') id: string) {
    return this.guidesService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Создать гайд (ADMIN/MODERATOR)' })
  create(@Body() dto: CreateGuideDto, @Request() req: any) {
    return this.guidesService.create(dto, req.user.sub);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Опубликовать гайд (ADMIN)' })
  publish(@Param('id') id: string) {
    return this.guidesService.setPublished(id, true);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Снять с публикации (ADMIN)' })
  unpublish(@Param('id') id: string) {
    return this.guidesService.setPublished(id, false);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Лайк / убрать лайк на гайд (toggle)' })
  toggleLike(@Param('id') id: string, @Request() req: any) {
    return this.guidesService.toggleLike(id, req.user.sub);
  }
}
