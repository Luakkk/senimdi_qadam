import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alua@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'TOTP-код из приложения аутентификатора (если включена 2FA)',
  })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  totpCode?: string;
}
