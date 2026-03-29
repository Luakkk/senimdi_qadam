import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSpecialistReviewDto {
  @ApiProperty({ example: 5, description: 'Оценка специалиста от 1 до 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Профессиональный подход, рекомендую' })
  @IsOptional()
  @IsString()
  comment?: string;
}
