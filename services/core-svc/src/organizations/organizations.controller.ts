import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { ListOrganizationsQuery } from './dto/list-organizations.query';
import { NearbyQueryDto } from './dto/nearby.query';
@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  @Get()
  list(@Query() query: ListOrganizationsQuery) {
    return this.orgs.list(query);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const org = await this.orgs.getById(id);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }
@Get('nearby')
nearby(@Query() q: NearbyQueryDto) {
  return this.orgs.nearby({
    lat: q.lat,
    lon: q.lon,
    radius: q.radius,
    verified: q.verified === 'true',
  });
}}