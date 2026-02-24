import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateOrganizationDto {
  @IsString() name!: string;
  @IsString() type!: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() address?: string;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() telegram?: string;

  @IsOptional() @IsBoolean() accessRamp?: boolean;
  @IsOptional() @IsBoolean() accessLift?: boolean;
  @IsOptional() @IsBoolean() onlineConsult?: boolean;
  @IsOptional() @IsBoolean() wheelchair?: boolean;

  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lon?: number;
}