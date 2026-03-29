import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ModerateCommentDto {
  @ApiProperty({ enum: ['PUBLISHED', 'REJECTED'], example: 'PUBLISHED' })
  @IsEnum(['PUBLISHED', 'REJECTED'])
  status: 'PUBLISHED' | 'REJECTED';

  @ApiProperty({ required: false, example: 'Нарушение правил сообщества' })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
