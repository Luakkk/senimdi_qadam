import { Transform } from 'class-transformer';
import { IsBooleanString, IsNumber, IsOptional, Min } from 'class-validator';

export class NearbyQueryDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  lat!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  lon!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  radius!: number; // meters

  @IsOptional()
  @IsBooleanString()
  verified?: string; // "true"/"false"
}