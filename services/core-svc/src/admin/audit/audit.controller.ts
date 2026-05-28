import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard }   from '../../auth/guards/roles.guard';
import { Roles }        from '../../auth/decorators/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('Admin / Audit')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MODERATOR')
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'История действий администраторов (cursor-based)' })
  @ApiQuery({ name: 'actorId',    required: false, type: String })
  @ApiQuery({ name: 'targetType', required: false, type: String })
  @ApiQuery({ name: 'action',     required: false, type: String })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  @ApiQuery({ name: 'cursor',     required: false, type: String })
  getLogs(
    @Query('actorId')    actorId?: string,
    @Query('targetType') targetType?: string,
    @Query('action')     action?: string,
    @Query('limit')      limit  = 50,
    @Query('cursor')     cursor?: string,
  ) {
    return this.audit.getLogs({
      actorId,
      targetType,
      action,
      limit: Number(limit),
      cursor,
    });
  }
}
