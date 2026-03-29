import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
  }

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email уже используется');

    const hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email:    dto.email,
        passwordHash: hash,
        role:     dto.role,
        profile: {
          create: {
            firstName:     dto.firstName,
            lastName:      dto.lastName,
            phone:         dto.phone ?? null,
            disabilityType: dto.disabilityType ?? null,
          },
        },
      },
      include: { profile: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    // Сохраняем refresh в Redis (highload: возможность отзыва)
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Неверный email или пароль');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  async logout(userId: string) {
    await this.redis.deleteRefreshToken(userId);
    return { message: 'Вы вышли из системы' };
  }

  // ─── REFRESH TOKEN ─────────────────────────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token недействителен');
    }

    // Проверяем что токен совпадает с тем что в Redis
    const stored = await this.redis.getRefreshToken(payload.sub);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token отозван или истёк');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    // Ротация: заменяем старый refresh на новый
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Не сообщаем что пользователь не найден (защита от перебора email)
    if (!user) return { message: 'Если email существует — письмо отправлено' };

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем в Redis на 15 минут
    await this.redis.setResetCode(dto.email, code);

    // Отправляем письмо через Resend
    await this.resend.emails.send({
      from: this.config.get('EMAIL_FROM') || 'onboarding@resend.dev',
      to:   dto.email,
      subject: 'Сброс пароля — SenimdiQAdam',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb;">SenimdiQAdam</h2>
          <p>Вы запросили сброс пароля.</p>
          <p>Ваш код подтверждения:</p>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
          </div>
          <p style="color: #64748b;">Код действителен <strong>15 минут</strong>.</p>
          <p style="color: #64748b;">Если вы не запрашивали сброс пароля — проигнорируйте это письмо.</p>
        </div>
      `,
    });

    return { message: 'Если email существует — письмо отправлено' };
  }

  // ─── RESET PASSWORD ────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const stored = await this.redis.getResetCode(dto.email);

    if (!stored || stored !== dto.code) {
      throw new BadRequestException('Неверный или просроченный код');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const hash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { passwordHash: hash },
    });

    // Удаляем код и refresh токен (принудительный логаут везде)
    await Promise.all([
      this.redis.deleteResetCode(dto.email),
      this.redis.deleteRefreshToken(user.id),
    ]);

    return { message: 'Пароль успешно изменён. Войдите заново.' };
  }

  // ─── GOOGLE OAUTH ──────────────────────────────────────────────────────────
  async findOrCreateGoogleUser(googleProfile: {
    googleId:  string;
    email:     string;
    firstName: string;
    lastName:  string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleProfile.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email: googleProfile.email } });

      if (user) {
        // Привязываем Google к существующему аккаунту
        user = await this.prisma.user.update({
          where: { id: user.id },
          data:  { googleId: googleProfile.googleId },
        });
      } else {
        // Создаём новый аккаунт через Google (роль USER по умолчанию)
        user = await this.prisma.user.create({
          data: {
            email:      googleProfile.email,
            googleId:   googleProfile.googleId,
            isVerified: true,
            role:       'USER',
            profile: {
              create: {
                firstName: googleProfile.firstName,
                lastName:  googleProfile.lastName,
                avatarUrl: googleProfile.avatarUrl ?? null,
              },
            },
          },
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─── GET ME ────────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
      omit: { passwordHash: true },
    });
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret:    this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret:    this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }
}
