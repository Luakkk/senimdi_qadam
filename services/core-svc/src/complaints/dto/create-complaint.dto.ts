import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({ example: 'На карте неправильный адрес / нет пандуса / мошенники и т.д.' })
  @IsString()
  @MinLength(3)
  message!: string;

  @ApiPropertyOptional({ example: 'org_cuid_id' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: '+7700...' })
  @IsOptional()
  @IsString()
  contact?: string;
}