import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum, IsNumber, IsBoolean, IsUrl } from 'class-validator';
import { OrgCategory } from '@prisma/client';

export class RegisterOrganizationDto {
  @ApiProperty({ description: 'Название организации (на русском)' })
  @IsString()
  nameRu: string;

  @ApiPropertyOptional({ description: 'Название на казахском' })
  @IsOptional()
  @IsString()
  nameKk?: string;

  @ApiPropertyOptional({ enum: OrgCategory })
  @IsOptional()
  @IsEnum(OrgCategory)
  category?: OrgCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ default: 'Алматы' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lon?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAccessible?: boolean;

  @ApiPropertyOptional({ description: 'Часы работы (например: Пн-Пт 9:00-18:00)' })
  @IsOptional()
  @IsString()
  workingHours?: string;
}
