import { IsOptional, IsString } from 'class-validator';

export class VerifyOrganizationDto {
  @IsString() method!: string; // call/site/doc/visit
  @IsOptional() @IsString() moderatorId?: string;
  @IsOptional() @IsString() comment?: string;
}