import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать заявку на поездку' })
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои заявки' })
  getMyBookings(@Req() req: any) {
    return this.bookingsService.getMyBookings(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детали заявки (с сообщениями)' })
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.bookingsService.getOne(req.user.sub, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Отменить заявку' })
  cancel(
    @Req() req: any,
    @Param('id') id: string,
    @Query('reason') reason?: string,
  ) {
    return this.bookingsService.cancel(req.user.sub, id, reason);
  }
}
