import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: 43.238949, description: 'Широта' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: 76.889709, description: 'Долгота' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;
}
