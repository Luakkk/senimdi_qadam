import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class RequestLinkDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email человека с инвалидностью которого опекаешь',
  })
  @IsEmail()
  dependentEmail: string;

  @ApiPropertyOptional({ example: 'мама', description: 'Степень родства' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;
}
