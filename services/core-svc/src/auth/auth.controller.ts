import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
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
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { randomUUID } from 'crypto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private redis: RedisService,
  ) {}

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
    // req.user — полный объект из БД (JwtStrategy.validate возвращает User),
    // поэтому используем .id, а не .sub
    return this.authService.logout(req.user.id);
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
    return this.authService.getMe(req.user.id);
  }

  // ═══ EMAIL VERIFICATION ═══════════════════════════════════════════════════

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подтвердить email по токену из письма (?token=...)' })
  @ApiResponse({ status: 200, description: 'Email подтверждён' })
  @ApiResponse({ status: 400, description: 'Ссылка недействительна или истекла' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Повторно отправить письмо-подтверждение' })
  resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
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

  // ═══ TWO-FACTOR AUTHENTICATION (TOTP) ════════════════════════════════════

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Начать настройку 2FA — получить secret и otpauth URL' })
  setup2fa(@Req() req: any) {
    return this.authService.setup2fa(req.user.id);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Подтвердить TOTP-код и активировать 2FA' })
  verify2fa(@Req() req: any, @Body() body: { token: string }) {
    return this.authService.verify2fa(req.user.id, body.token);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Отключить 2FA (требует текущий TOTP-код)' })
  disable2fa(@Req() req: any, @Body() body: { token: string }) {
    return this.authService.disable2fa(req.user.id, body.token);
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

    // Безопасный обмен токенов: одноразовый code в Redis (TTL 30 секунд).
    // Фронтенд получает только code в URL и обменивает его на токены через POST /auth/exchange-code.
    // Токены НЕ попадают в URL, историю браузера, referrer заголовки и аналитику.
    const code = randomUUID();
    await this.redis.set(`oauth_code:${code}`, JSON.stringify(tokens), 30);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?code=${code}`);
  }

  @Post('exchange-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обменять одноразовый OAuth code на токены',
    description: 'Фронтенд вызывает этот эндпоинт после Google OAuth редиректа. Code действителен 30 секунд.',
  })
  async exchangeCode(@Body('code') code: string) {
    if (!code) throw new BadRequestException('code обязателен');

    // GETDEL — атомарно читаем и удаляем (одноразовый code, повторный вызов → 404)
    const raw = await this.redis.getdel(`oauth_code:${code}`);
    if (!raw) throw new NotFoundException('Code не найден или истёк');

    return JSON.parse(raw as string);
  }
}
