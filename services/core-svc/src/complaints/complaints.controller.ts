import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';

@ApiTags('complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly service: ComplaintsService) {}

  @Post()
  @ApiHeader({ name: 'x-user-id', required: false })
  @ApiHeader({ name: 'x-role', required: false })
  create(
    @Body() dto: CreateComplaintDto,
    @Headers('x-user-id') userId?: string,
    @Headers('x-role') role?: string,
  ) {
    return this.service.create(dto, { userId, role });
  }
}