import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/jwt-auth.guard';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private driversService: DriversService) {}

  // ─── Публичные ────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Список водителей (публичный)' })
  @ApiQuery({ name: 'status', enum: DriverStatus, required: false })
  findAll(@Query('status') status?: DriverStatus) {
    return this.driversService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Профиль водителя с отзывами и WhatsApp-ссылкой' })
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  // ─── Только аутентифицированные ───────────────────────────────────────────

  @Post('bookings/:bookingId/review')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Оставить отзыв после завершённой поездки (1–5 ★)' })
  addReview(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.driversService.addReview(req.user.sub, bookingId, dto);
  }

  // ─── Менеджер / Админ ─────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TAXI_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Добавить водителя (менеджер/админ)' })
  create(@Body() dto: CreateDriverDto) {
    return this.driversService.create(dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TAXI_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Изменить статус водителя (ACTIVE / INACTIVE / SUSPENDED)' })
  @ApiQuery({ name: 'status', enum: DriverStatus })
  setStatus(@Param('id') id: string, @Query('status') status: DriverStatus) {
    return this.driversService.setStatus(id, status);
  }
}
