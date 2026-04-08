import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/jwt-auth.guard';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // ─── Пользователь ─────────────────────────────────────────────────────────

  @Get('bookings/:bookingId/messages')
  @ApiOperation({ summary: 'Сообщения по заявке (пользователь видит только свои)' })
  getMessages(@Req() req: any, @Param('bookingId') bookingId: string) {
    return this.chatService.getMessages(bookingId, req.user.sub, false);
  }

  @Post('bookings/:bookingId/messages')
  @ApiOperation({ summary: 'Отправить сообщение (пользователь → менеджер)' })
  sendAsUser(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendAsUser(req.user.sub, bookingId, dto);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Количество непрочитанных (badge для пользователя)' })
  getUnreadUser(@Req() req: any) {
    return this.chatService.getUnreadCount(req.user.sub, false);
  }

  // ─── Менеджер ──────────────────────────────────────────────────────────────

  @Get('manager/bookings/:bookingId/messages')
  @UseGuards(RolesGuard)
  @Roles('TAXI_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Сообщения по заявке (менеджер)' })
  getMessagesManager(@Req() req: any, @Param('bookingId') bookingId: string) {
    return this.chatService.getMessages(bookingId, req.user.sub, true);
  }

  @Post('manager/bookings/:bookingId/messages')
  @UseGuards(RolesGuard)
  @Roles('TAXI_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Отправить сообщение (менеджер → пользователь)' })
  sendAsManager(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendAsManager(req.user.sub, bookingId, dto);
  }

  @Get('manager/unread')
  @UseGuards(RolesGuard)
  @Roles('TAXI_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Непрочитанные сообщения от пользователей (badge для менеджера)' })
  getUnreadManager(@Req() req: any) {
    return this.chatService.getUnreadCount(req.user.sub, true);
  }
}
