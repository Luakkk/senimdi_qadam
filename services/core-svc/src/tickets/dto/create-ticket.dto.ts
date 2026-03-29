import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Нужна помощь с документами на пособие' })
  @IsString()
  @MinLength(3)
  subject!: string;

  @ApiProperty({ example: 'Подробное описание ситуации: что нужно сделать, куда обращаться.' })
  @IsString()
  @MinLength(5)
  body!: string;
}
