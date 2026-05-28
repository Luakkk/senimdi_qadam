import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({ example: 'fcm_token_here', description: 'FCM registration token' })
  @IsString() token: string;

  @ApiProperty({ enum: ['android', 'ios', 'web'], example: 'android' })
  @IsIn(['android', 'ios', 'web']) platform: string;
}
