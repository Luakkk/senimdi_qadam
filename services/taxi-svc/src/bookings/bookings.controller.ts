import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Создать бронирование поездки' })
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои бронирования' })
  getMyBookings(@Req() req: any) {
    return this.bookingsService.getMyBookings(req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Отменить бронирование' })
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.bookingsService.cancel(req.user.sub, id);
  }

  @Get('nearby-drivers')
  @ApiOperation({ summary: 'Найти ближайших водителей (Haversine)' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lon', type: Number })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  findNearby(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string,
  ) {
    return this.bookingsService.findNearbyDrivers(
      parseFloat(lat),
      parseFloat(lon),
      radius ? parseFloat(radius) : 10,
    );
  }
}
