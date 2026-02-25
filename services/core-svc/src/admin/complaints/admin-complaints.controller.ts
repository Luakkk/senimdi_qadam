import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/admin.guard';
import { ComplaintsService } from '../../complaints/complaints.service';

@ApiTags('admin/complaints')
@ApiHeader({ name: 'x-admin-key', required: true })
@ApiHeader({ name: 'x-role', required: false, description: 'ADMIN' })
@UseGuards(AdminGuard)
@Controller('admin/complaints')
export class AdminComplaintsController {
  constructor(private readonly service: ComplaintsService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Patch(':id')
  setStatus(@Param('id') id: string, @Body() body: { status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' }) {
    return this.service.setStatus(id, body.status);
  }
}