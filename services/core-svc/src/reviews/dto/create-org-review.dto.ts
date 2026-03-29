import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateOrgReviewDto {
  @ApiProperty({ example: 4, description: 'Оценка от 1 до 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Очень помогли, доброжелательный персонал' })
  @IsOptional()
  @IsString()
  comment?: string;
}
