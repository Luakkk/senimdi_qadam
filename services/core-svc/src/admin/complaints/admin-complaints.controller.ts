import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ComplaintStatus } from '@prisma/client';
import { AdminGuard } from '../../auth/admin.guard';
import { ComplaintsService } from '../../complaints/complaints.service';

@ApiTags('admin/complaints')
@ApiHeader({ name: 'x-admin-key', required: true })
@UseGuards(AdminGuard)
@Controller('admin/complaints')
export class AdminComplaintsController {
  constructor(private readonly service: ComplaintsService) {}

  @Get()
  list() {
    return this.service.listAll(undefined, 100, 0);
  }

  // ComplaintStatus: OPEN | UNDER_REVIEW | RESOLVED | DISMISSED
  @Patch(':id')
  setStatus(@Param('id') id: string, @Body() body: { status: ComplaintStatus }) {
    return this.service.updateStatus(id, body.status);
  }
}
