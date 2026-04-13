import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { VehicleType } from '@prisma/client';

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

  @ApiProperty({ example: '777 AKB 02' })
  @IsString()
  licensePlate!: string;

  @ApiProperty({ required: false, example: '+77001234567' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ required: false, enum: VehicleType, example: VehicleType.WHEELCHAIR_VAN })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiProperty({ required: false, example: 'Toyota Alphard' })
  @IsOptional()
  @IsString()
  vehicleModel?: string;
}
