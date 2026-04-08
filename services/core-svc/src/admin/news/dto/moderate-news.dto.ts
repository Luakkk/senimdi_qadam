import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '@prisma/client';

export class ModerateNewsDto {
  @IsEnum(NewsStatus)
  status!: NewsStatus;

  @IsOptional()
  @IsString()
  rejectReason?: string;
}
