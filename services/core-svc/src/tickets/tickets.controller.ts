import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Post()
  @ApiHeader({ name: 'x-user-id', required: false })
  @ApiHeader({ name: 'x-role', required: false })
  create(
    @Body() dto: CreateTicketDto,
    @Headers('x-user-id') userId?: string,
    @Headers('x-role') role?: string,
  ) {
    return this.service.create(dto, { userId, role });
  }
}