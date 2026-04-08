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
import { BookingStatus } from '@prisma/client';
import { ManagerService } from './manager.service';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/jwt-auth.guard';

@ApiTags('Manager')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TAXI_MANAGER', 'ADMIN')
@Controller('manager')
export class ManagerController {
  constructor(private managerService: ManagerService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Статистика: количество заявок по статусам' })
  getStats() {
    return this.managerService.getStats();
  }

  @Get('queue')
  @ApiOperation({ summary: 'Очередь PENDING заявок (FIFO — по времени подачи)' })
  getQueue() {
    return this.managerService.getQueue();
  }

  @Get('drivers/available')
  @ApiOperation({ summary: 'Свободные водители (ACTIVE)' })
  getAvailableDrivers() {
    return this.managerService.getAvailableDrivers();
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Все заявки (фильтр по статусу)' })
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  getAllBookings(@Query('status') status?: BookingStatus) {
    return this.managerService.getAllBookings(status);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Детали заявки с чатом и отзывом' })
  getBookingDetail(@Param('id') id: string) {
    return this.managerService.getBookingDetail(id);
  }

  @Patch('bookings/:id/assign')
  @ApiOperation({ summary: 'Назначить водителя → статус CONFIRMED' })
  assignDriver(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AssignDriverDto,
  ) {
    return this.managerService.assignDriver(req.user.sub, id, dto);
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Изменить статус заявки (IN_PROGRESS / COMPLETED / CANCELLED)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.managerService.updateStatus(id, dto);
  }
}
