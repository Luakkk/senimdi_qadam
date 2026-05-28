import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateOrgServiceDto {
  @ApiProperty({ example: 'Консультация логопеда' })
  @IsString() nameRu: string;

  @ApiPropertyOptional() @IsOptional() @IsString() nameKk?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionRu?: string;

  @ApiPropertyOptional({ example: 0, description: '0 = бесплатно' })
  @IsOptional() @IsNumber() @Min(0) price?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean() isActive?: boolean;
}
