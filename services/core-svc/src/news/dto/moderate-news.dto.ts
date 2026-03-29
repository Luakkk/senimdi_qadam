import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '@prisma/client';

export class ModerateNewsDto {
  @ApiProperty({ enum: [NewsStatus.PUBLISHED, NewsStatus.REJECTED] })
  @IsEnum(NewsStatus)
  status: 'PUBLISHED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Нарушает правила публикации' })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
