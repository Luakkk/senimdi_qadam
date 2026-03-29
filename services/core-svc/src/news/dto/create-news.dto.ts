import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'Новый реабилитационный центр открылся в Алматы' })
  @IsString()
  titleRu: string;

  @ApiPropertyOptional({ example: 'Алматыда жаңа оңалту орталығы ашылды' })
  @IsOptional()
  @IsString()
  titleKk?: string;

  @ApiProperty({ example: 'Подробный текст новости...' })
  @IsString()
  bodyRu: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyKk?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
