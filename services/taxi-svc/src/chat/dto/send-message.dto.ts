import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Водитель будет в 14:30' })
  @IsString()
  @MinLength(1)
  text!: string;
}
