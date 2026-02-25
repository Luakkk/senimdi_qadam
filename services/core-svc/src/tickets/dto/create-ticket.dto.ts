import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Нужна помощь: консультация / документы / перевозка' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Описание ситуации и что нужно сделать' })
  @IsString()
  @MinLength(5)
  description!: string;

  @ApiPropertyOptional({ example: 'org_cuid_id' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: '+7700...' })
  @IsOptional()
  @IsString()
  contact?: string;
}