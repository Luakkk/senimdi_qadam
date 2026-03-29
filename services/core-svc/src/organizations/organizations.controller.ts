import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { ListOrganizationsQuery } from './dto/list-organizations.query';
import { NearbyQueryDto } from './dto/nearby.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

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
}
