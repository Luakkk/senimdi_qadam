import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RegisterManagerDto {
  @ApiProperty({ example: 'INVITE-XXXX-YYYY', description: 'Инвайт-код от администратора' })
  @IsString()
  inviteCode!: string;

  @ApiProperty({ example: 'Айгерим' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Сейткалиева' })
  @IsString()
  lastName!: string;

  @ApiProperty({ required: false, example: '+77011234567' })
  @IsString()
  @MinLength(10)
  phone!: string;
}
