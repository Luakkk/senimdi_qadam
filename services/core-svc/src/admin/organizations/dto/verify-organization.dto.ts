import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrgStatus } from '@prisma/client';

export class VerifyOrganizationDto {
  @IsString()
  method!: string; // call/site/doc/visit

  @IsEnum(OrgStatus)
  statusTo!: OrgStatus; // PENDING | VERIFIED | ARCHIVED | DRAFT (как решишь)

  @IsOptional()
  @IsString()
  moderatorId?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}