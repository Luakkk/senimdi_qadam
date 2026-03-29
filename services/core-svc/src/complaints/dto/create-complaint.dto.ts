import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateComplaintDto {
  // На кого жалоба: 'organization' | 'user'
  @ApiProperty({ example: 'organization', description: 'Тип цели: organization | user' })
  @IsString()
  @IsIn(['organization', 'user'])
  targetType!: string;

  // ID организации или пользователя
  @ApiProperty({ example: 'uuid-организации-или-юзера' })
  @IsString()
  targetId!: string;

  // Краткая причина жалобы
  @ApiProperty({ example: 'Неверный адрес на карте' })
  @IsString()
  @MinLength(3)
  reason!: string;

  // Подробное описание (опционально)
  @ApiPropertyOptional({ example: 'Адрес указан как ул. Абая 10, но реально это ул. Абая 12' })
  @IsOptional()
  @IsString()
  description?: string;
}
