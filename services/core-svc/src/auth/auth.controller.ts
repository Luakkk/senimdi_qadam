import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ═══ РЕГИСТРАЦИЯ ══════════════════════════════════════════════════════════

  @Post('register')
  @ApiOperation({ summary: 'Регистрация (USER или RELATIVE)' })
  @ApiResponse({ status: 201, description: 'Возвращает accessToken + refreshToken' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ═══ ЛОГИН / ЛОГАУТ ═══════════════════════════════════════════════════════

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // Highload: строгий лимит на login — 10 попыток за 60 сек (защита от брутфорса)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Вход по email + пароль' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Выход — инвалидирует refresh token в Redis' })
  logout(@Req() req: any) {
    return this.authService.logout(req.user.sub);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновить access token через refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // ═══ ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ ═════════════════════════════════════════════════

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Мой профиль (из JWT)' })
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub);
  }

  // ═══ СБРОС ПАРОЛЯ ═════════════════════════════════════════════════════════

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  // Строгий лимит: 5 запросов за 60 сек — защита от спама писем
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Запросить код сброса пароля на email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сбросить пароль по коду из письма' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ═══ GOOGLE OAUTH ══════════════════════════════════════════════════════════

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Войти через Google аккаунт (редирект)' })
  googleLogin() {
    // passport сам делает редирект на Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback (не вызывать вручную)' })
  async googleCallback(@Req() req: any, @Res() res: any) {
    const tokens = await this.authService.findOrCreateGoogleUser(req.user);
    // Редиректим на фронтенд с токенами в query params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
