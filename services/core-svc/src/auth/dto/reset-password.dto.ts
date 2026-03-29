import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'alua@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '847291', description: '6-значный код из письма' })
  @IsString()
  @Length(6, 6, { message: 'Код должен быть 6 символов' })
  code: string;

  @ApiProperty({ example: 'NewPass123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль должен содержать заглавную букву, строчную и цифру',
  })
  newPassword: string;
}
