import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Очень важная новость, спасибо!', description: 'Текст комментария' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;
}
