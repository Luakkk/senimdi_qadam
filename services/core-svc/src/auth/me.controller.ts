import { Controller, Get, Headers } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('me')
export class MeController {
  @Get()
  @ApiHeader({ name: 'x-user-id', required: false })
  @ApiHeader({ name: 'x-role', required: false, description: 'USER | RELATIVE | ORG_MANAGER | ADMIN' })
  me(@Headers('x-user-id') userId?: string, @Headers('x-role') role?: string) {
    return {
      userId: userId ?? 'demo_user_1',
      role: role ?? 'USER',
    };
  }
}