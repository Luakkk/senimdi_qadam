import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ComplaintStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ComplaintsService } from '../../complaints/complaints.service';

@ApiTags('Admin / Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('admin/complaints')
export class AdminComplaintsController {
  constructor(private readonly service: ComplaintsService) {}

  @Get()
  @ApiQuery({ name: 'status', enum: ComplaintStatus, required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  list(
    @Query('status') status?: ComplaintStatus,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    return this.service.listAll(status, +limit, +offset);
  }

  @Patch(':id')
  setStatus(
    @Param('id') id: string,
    @Body() body: { status: ComplaintStatus },
  ) {
    return this.service.updateStatus(id, body.status);
  }
}
