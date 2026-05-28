import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import { ListOrganizationsQuery } from './dto/list-organizations.query';
import { NearbyQueryDto } from './dto/nearby.query';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateOrgServiceDto } from './dto/create-org-service.dto';
import { UpdateOrgServiceDto } from './dto/update-org-service.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  // ── Самостоятельная регистрация организации ──────────────────────────────
  // Доступно для любого авторизованного пользователя.
  // Создаёт заявку со статусом PENDING и повышает роль до ORG_MANAGER.
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Подать заявку на регистрацию организации (self-service)' })
  register(@Request() req: any, @Body() dto: RegisterOrganizationDto) {
    return this.orgs.register(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список организаций с фильтрацией' })
  list(@Query() query: ListOrganizationsQuery) {
    return this.orgs.list(query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Организации рядом (Haversine)' })
  nearby(@Query() q: NearbyQueryDto) {
    return this.orgs.nearby({
      lat: q.lat,
      lon: q.lon,
      radius: q.radius,
      verified: q.verified === 'true',
    });
  }

  // ── Поиск для AI-ассистента (ai-svc вызывает этот endpoint, а не DB напрямую)
  @Get('search')
  @ApiOperation({ summary: 'Полнотекстовый поиск организаций (для AI-сервиса)' })
  @ApiQuery({ name: 'query',    required: true,  description: 'Поисковый запрос' })
  @ApiQuery({ name: 'category', required: false, description: 'Категория (OrgCategory enum)' })
  @ApiQuery({ name: 'limit',    required: false, description: 'Лимит результатов (по умолчанию 10)' })
  search(
    @Query('query')    query:     string,
    @Query('category') category?: string,
    @Query('limit')    limit?:    string,
  ) {
    return this.orgs.search({
      query:    query ?? '',
      category: category,
      limit:    limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Карточка организации' })
  async get(@Param('id') id: string) {
    const org = await this.orgs.getById(id);
    if (!org) throw new NotFoundException('Организация не найдена');
    return org;
  }

  // ═══ СОХРАНЁННЫЕ ОРГАНИЗАЦИИ ══════════════════════════════════════════════

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Сохранить организацию в избранное' })
  save(@Param('id') id: string, @Request() req: any) {
    return this.orgs.saveOrg(req.user.sub, id);
  }

  @Delete(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Убрать организацию из избранного' })
  unsave(@Param('id') id: string, @Request() req: any) {
    return this.orgs.unsaveOrg(req.user.sub, id);
  }

  // ═══ ORG_MANAGER PORTAL ════════════════════════════════════════════════════

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Моя организация' })
  getMine(@Request() req: any) {
    return this.orgs.getMine(req.user.sub);
  }

  @Patch('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Обновить информацию об организации' })
  updateMine(@Request() req: any, @Body() dto: UpdateOrganizationDto) {
    return this.orgs.updateMine(req.user.sub, dto);
  }

  @Get('mine/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Аналитика организации (сохранения, отзывы, рейтинг)' })
  getMyAnalytics(@Request() req: any) {
    return this.orgs.getMyAnalytics(req.user.sub);
  }

  @Get('mine/saved-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Пользователи, сохранившие организацию' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  getMySavedUsers(
    @Request() req: any,
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.orgs.getMySavedUsers(req.user.sub, Number(limit), Number(offset));
  }

  @Get('mine/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Список услуг организации' })
  listMyServices(@Request() req: any) {
    return this.orgs.listMyServices(req.user.sub);
  }

  @Post('mine/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Добавить услугу' })
  createMyService(@Request() req: any, @Body() dto: CreateOrgServiceDto) {
    return this.orgs.createMyService(req.user.sub, dto);
  }

  @Patch('mine/services/:serviceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Обновить услугу' })
  updateMyService(
    @Request() req: any,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateOrgServiceDto,
  ) {
    return this.orgs.updateMyService(req.user.sub, serviceId, dto);
  }

  @Delete('mine/services/:serviceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[ORG_MANAGER] Удалить услугу' })
  deleteMyService(@Request() req: any, @Param('serviceId') serviceId: string) {
    return this.orgs.deleteMyService(req.user.sub, serviceId);
  }
}
