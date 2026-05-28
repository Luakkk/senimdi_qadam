import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Мои уведомления (cursor-based)' })
  @ApiQuery({ name: 'limit',    required: false, type: Number })
  @ApiQuery({ name: 'cursor',   required: false, type: String })
  @ApiQuery({ name: 'unread',   required: false, type: Boolean })
  getMyNotifications(
    @Req() req: any,
    @Query('limit')  limit  = 20,
    @Query('cursor') cursor?: string,
    @Query('unread') unread?: string,
  ) {
    return this.svc.getMyNotifications(
      req.user.sub,
      Number(limit),
      cursor,
      unread === 'true',
    );
  }

  @Patch('my/read-all')
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  markAllRead(@Req() req: any) {
    return this.svc.markAllRead(req.user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Отметить уведомление прочитанным' })
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.svc.markRead(req.user.sub, id);
  }
}
