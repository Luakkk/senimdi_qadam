import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'alua@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;
}
