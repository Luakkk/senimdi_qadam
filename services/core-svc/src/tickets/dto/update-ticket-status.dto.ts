import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, example: 'IN_PROGRESS' })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
