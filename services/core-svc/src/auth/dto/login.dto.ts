import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alua@example.com' })
  @IsEmail()
  email: string;

  // MaxLength(128) — защита от bcrypt DoS:
  // без ограничения атакующий может отправить строку 10MB+,
  // которую bcrypt будет хэшировать несколько минут, подвешивая Node.js event loop.
  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MaxLength(128, { message: 'Пароль не может быть длиннее 128 символов' })
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
