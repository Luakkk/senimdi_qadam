import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { DisabilityType, Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'alua@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8, { message: 'Пароль минимум 8 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль должен содержать заглавную букву, строчную и цифру',
  })
  password: string;

  @ApiProperty({ example: 'Алуа' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Рустамовна' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+7 701 123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    enum: [Role.USER, Role.RELATIVE],
    description: 'USER — человек с инвалидностью, RELATIVE — родственник/опекун',
    example: Role.USER,
  })
  @IsEnum([Role.USER, Role.RELATIVE], {
    message: 'Роль может быть только USER или RELATIVE',
  })
  role: 'USER' | 'RELATIVE';

  @ApiPropertyOptional({
    enum: DisabilityType,
    description: 'Тип инвалидности (только для роли USER)',
  })
  @IsOptional()
  @IsEnum(DisabilityType)
  disabilityType?: DisabilityType;
}
