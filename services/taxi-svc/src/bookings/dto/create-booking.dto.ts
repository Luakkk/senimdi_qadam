import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-slot' })
  @IsString()
  slotId: string;

  @ApiProperty({ example: 'ул. Абая 1, Алматы' })
  @IsString()
  fromAddress: string;

  @ApiProperty({ example: 'ул. Достык 10, Алматы' })
  @IsString()
  toAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fromLat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fromLon?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  toLat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  toLon?: number;

  @ApiProperty({ example: 'Нужна машина с подъёмником', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
