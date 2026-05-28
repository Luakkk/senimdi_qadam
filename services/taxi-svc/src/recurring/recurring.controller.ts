import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { DisabilityType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecurringService } from './recurring.service';

class CreateRecurringDto {
  @IsString() @IsNotEmpty()
  fromAddress: string;

  @IsString() @IsNotEmpty()
  toAddress: string;

  @IsNumber() @IsOptional()
  fromLat?: number;

  @IsNumber() @IsOptional()
  fromLon?: number;

  @IsNumber() @IsOptional()
  toLat?: number;

  @IsNumber() @IsOptional()
  toLon?: number;

  @IsEnum(DisabilityType)
  disabilityType: DisabilityType;

  @IsString() @IsOptional()
  note?: string;

  @IsString() @IsNotEmpty()
  /** Cron expression (5-part). Example: "0 9 * * 1-5" = weekdays at 09:00 */
  cronExpression: string;
}

@ApiTags('Recurring Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings/recurring')
export class RecurringController {
  constructor(private readonly svc: RecurringService) {}

  @Post()
  @ApiOperation({ summary: 'Создать расписание повторяющейся поездки' })
  create(@Req() req: any, @Body() dto: CreateRecurringDto) {
    return this.svc.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Мои повторяющиеся поездки' })
  getMyRecurring(@Req() req: any) {
    return this.svc.getMyRecurring(req.user.sub);
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Приостановить расписание' })
  pause(@Req() req: any, @Param('id') id: string) {
    return this.svc.toggleActive(req.user.sub, id, false);
  }

  @Patch(':id/resume')
  @ApiOperation({ summary: 'Возобновить расписание' })
  resume(@Req() req: any, @Param('id') id: string) {
    return this.svc.toggleActive(req.user.sub, id, true);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить расписание' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.svc.remove(req.user.sub, id);
  }
}
