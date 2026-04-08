import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { OrgCategory } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString() nameRu!: string;
  @IsOptional() @IsString() nameKk?: string;
  @IsOptional() @IsString() nameEn?: string;

  @IsEnum(OrgCategory) category!: OrgCategory;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() workingHours?: string;

  @IsOptional() @IsBoolean() isAccessible?: boolean;

  @IsOptional() @IsNumber() @Min(-90)  @Max(90)  lat?: number;
  @IsOptional() @IsNumber() @Min(-180) @Max(180) lon?: number;
}
