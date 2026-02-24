import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { VerifyOrganizationDto } from './dto/verify-organization.dto';

@ApiTags('admin')
@Controller('admin/organizations')
export class AdminOrganizationsController {
  constructor(private readonly svc: AdminOrganizationsService) {}

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.svc.update(id, dto);
  }

  @Post(':id/verify')
  verify(@Param('id') id: string, @Body() dto: VerifyOrganizationDto) {
    return this.svc.verify(id, dto);
  }

  @Get('logs')
  logs(@Query('organizationId') organizationId?: string) {
    return this.svc.logs(organizationId);
  }
}