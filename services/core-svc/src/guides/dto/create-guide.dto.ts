import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateGuideDto {
  @ApiProperty({ example: 'Как оформить инвалидность в Казахстане' })
  @IsString()
  titleRu: string;

  @ApiPropertyOptional({ example: 'Қазақстанда мүгедектікті қалай ресімдеу керек' })
  @IsOptional()
  @IsString()
  titleKk?: string;

  @ApiProperty({ example: 'Подробная инструкция по шагам...' })
  @IsString()
  bodyRu: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyKk?: string;

  @ApiPropertyOptional({ example: 'legal' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['инвалидность', 'документы', 'МСЭК'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
