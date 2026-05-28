import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateOrgServiceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nameRu?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nameKk?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionRu?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
