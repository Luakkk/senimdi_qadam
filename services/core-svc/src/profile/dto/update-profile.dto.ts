import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DisabilityType } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Алуа' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Рустамовна' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  lastName?: string;

  @ApiPropertyOptional({ example: '+7 701 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '2000-05-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Алматы' })
  @IsOptional()
  @IsString()
  city?: string;

  // ── Только для USER ──────────────────────────────────────────────────────
  @ApiPropertyOptional({ enum: DisabilityType, description: 'Только для роли USER' })
  @IsOptional()
  @IsEnum(DisabilityType)
  disabilityType?: DisabilityType;

  @ApiPropertyOptional({ example: 'Передвигаюсь на коляске, нужны пандусы' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  disabilityNote?: string;
}
