import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { DisabilityType } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 'ул. Абая 1, Алматы' })
  @IsString()
  fromAddress!: string;

  @ApiProperty({ example: 'ул. Достык 10, Алматы' })
  @IsString()
  toAddress!: string;

  @ApiProperty({ required: false, example: 43.238 })
  @IsOptional()
  @IsNumber()
  fromLat?: number;

  @ApiProperty({ required: false, example: 76.945 })
  @IsOptional()
  @IsNumber()
  fromLon?: number;

  @ApiProperty({ required: false, example: 43.25 })
  @IsOptional()
  @IsNumber()
  toLat?: number;

  @ApiProperty({ required: false, example: 76.96 })
  @IsOptional()
  @IsNumber()
  toLon?: number;

  @ApiProperty({ example: '2026-04-10T10:00:00Z', description: 'Желаемое время поездки' })
  @IsDateString()
  scheduledAt!: string;

  @ApiProperty({ enum: DisabilityType, example: DisabilityType.WHEELCHAIR })
  @IsEnum(DisabilityType)
  disabilityType!: DisabilityType;

  @ApiProperty({ required: false, example: 'Нужна машина с подъёмником' })
  @IsOptional()
  @IsString()
  note?: string;
}
