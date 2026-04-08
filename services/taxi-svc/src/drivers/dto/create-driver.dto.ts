import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ example: 'Иван' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Петров' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '+77001234567' })
  @IsString()
  phone!: string;

  @ApiProperty({ required: false, example: '+77001234567' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ required: false, example: 'Минивэн с подъёмником' })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiProperty({ required: false, example: 'Toyota Alphard' })
  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @ApiProperty({ required: false, example: '777 AKB 02' })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiProperty({ required: false, example: 43.238 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ required: false, example: 76.945 })
  @IsOptional()
  @IsNumber()
  lon?: number;
}
