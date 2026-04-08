import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignDriverDto {
  @ApiProperty({ example: 'uuid-of-driver' })
  @IsString()
  driverId!: string;
}
