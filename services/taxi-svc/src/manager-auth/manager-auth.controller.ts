import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ManagerAuthService } from './manager-auth.service';
import { RegisterManagerDto } from './dto/register-manager.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/jwt-auth.guard';

@ApiTags('Manager Auth')
@ApiBearerAuth()
@Controller('manager-auth')
export class ManagerAuthController {
  constructor(private managerAuthService: ManagerAuthService) {}

  // ─── Только Admin: сгенерировать инвайт-код ───────────────────────────────
  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Сгенерировать инвайт-код для нового менеджера (Admin only)' })
  generateInvite() {
    return this.managerAuthService.generateInviteCode();
  }

  // ─── Только Admin: список всех инвайтов ───────────────────────────────────
  @Get('invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Список всех инвайт-кодов (Admin only)' })
  listInvites() {
    return this.managerAuthService.listInvites();
  }

  // ─── Любой авторизованный пользователь: зарегистрироваться как менеджер ───
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Зарегистрироваться как менеджер ИнваТакси (нужен инвайт-код)',
  })
  register(@Req() req: any, @Body() dto: RegisterManagerDto) {
    return this.managerAuthService.registerWithInvite(req.user.sub, dto);
  }

  // ─── Мой профиль менеджера ────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Мой профиль менеджера' })
  getProfile(@Req() req: any) {
    return this.managerAuthService.getMyProfile(req.user.sub);
  }
}
