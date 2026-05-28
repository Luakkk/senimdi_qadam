import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEmail,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Центр реабилитации «Надежда»' })
  @IsOptional() @IsString() nameRu?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() nameKk?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nameEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl()   website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instagram?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90)  @Max(90)  lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) @Max(180) lon?: number;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAccessible?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString()  workingHours?: string;
}
