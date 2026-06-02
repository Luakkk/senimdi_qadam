import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { encrypt, decrypt, isEncrypted } from './crypto.helper';
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

    // Отправляем письмо с подтверждением email
    await this.sendVerificationEmail(user.id, user.email);

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

    // Блокируем вход до подтверждения email.
    // Google OAuth пользователи верифицируются автоматически при создании.
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Email не подтверждён. Проверьте почту или запросите новое письмо через POST /auth/resend-verification',
      );
    }

    // ── 2FA check ──────────────────────────────────────────────────────────
    if (user.isTotpEnabled && user.totpSecret) {
      if (!dto.totpCode) {
        // Signal to the client that TOTP is required (don't issue tokens yet)
        return { requiresTwoFactor: true };
      }
      // Decrypt TOTP secret (stored AES-256-GCM encrypted)
      const plainSecret = isEncrypted(user.totpSecret)
        ? decrypt(user.totpSecret)
        : user.totpSecret; // legacy plaintext fallback (re-encrypt on next write)
      const valid2fa = speakeasy.totp.verify({
        secret:   plainSecret,
        encoding: 'base32',
        token:    dto.totpCode,
        window:   1, // allow 30s clock skew
      });
      if (!valid2fa) {
        throw new UnauthorizedException('Неверный код 2FA');
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.redis.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  async logout(userId: string) {
    await this.redis.deleteRefreshToken(userId);
    // Инвалидируем кэш пользователя из JwtStrategy
    await this.redis.del(`user_ctx:${userId}`);
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

    // Атомарно читаем и удаляем старый токен (GETDEL).
    // Если два запроса придут одновременно — только первый получит токен,
    // второй получит null и будет отклонён (race condition устранён).
    const stored = await this.redis.getAndDeleteRefreshToken(payload.sub);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token отозван или истёк');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    // Ротация: сохраняем новый refresh token
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
    // Атомарный GETDEL: читаем и сразу удаляем код за одну Redis-операцию.
    // Устраняет race condition — два одновременных запроса с одним кодом
    // не смогут оба пройти валидацию (второй получит null).
    const stored = await this.redis.getAndDeleteResetCode(dto.email);

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

    // Код уже удалён выше (atomic GETDEL). Только refresh-токен нужно удалить.
    await this.redis.deleteRefreshToken(user.id);
    // Инвалидируем кэш пользователя — при следующем запросе токен уже не пройдёт
    await this.redis.del(`user_ctx:${user.id}`);

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

  // ─── EMAIL VERIFICATION ────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const userId = await this.redis.getAndDeleteVerificationToken(token);
    if (!userId) {
      throw new BadRequestException('Ссылка подтверждения недействительна или истекла');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.isVerified) return { message: 'Email уже подтверждён' };

    await this.prisma.user.update({
      where: { id: userId },
      data:  { isVerified: true },
    });

    return { message: 'Email успешно подтверждён! Теперь вы можете войти.' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Не раскрываем существование email (защита от перебора)
    if (!user || user.isVerified) {
      return { message: 'Если email существует и не подтверждён — письмо отправлено' };
    }

    await this.sendVerificationEmail(user.id, user.email);
    return { message: 'Если email существует и не подтверждён — письмо отправлено' };
  }

  // ─── GET ME ────────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
      // totpSecret тоже исключаем — это секрет 2FA (даже зашифрованный не должен утекать в API)
      omit: { passwordHash: true, totpSecret: true },
    });
  }

  // ─── 2FA: SETUP ───────────────────────────────────────────────────────────
  // Generates a new TOTP secret and returns QR code URL (not yet enabled)
  async setup2fa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.isTotpEnabled) {
      throw new BadRequestException('2FA уже включён. Сначала отключите его.');
    }

    const secret = speakeasy.generateSecret({
      name:   `SenimdiQAdam (${user.email})`,
      length: 32,
    });

    // Encrypt the secret before storing (AES-256-GCM, key from ENCRYPTION_KEY env)
    const encryptedSecret = encrypt(secret.base32);

    // Save the encrypted secret in a pending state (not enabled until verified)
    await this.prisma.user.update({
      where: { id: userId },
      data:  { totpSecret: encryptedSecret },
    });

    return {
      secret:  secret.base32,
      otpauth: secret.otpauth_url,
      message: 'Отсканируйте QR-код в приложении (Google Authenticator, Authy), затем подтвердите код через POST /auth/2fa/verify',
    };
  }

  // ─── 2FA: VERIFY & ENABLE ─────────────────────────────────────────────────
  async verify2fa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.totpSecret) {
      throw new BadRequestException('Сначала выполните настройку 2FA через POST /auth/2fa/setup');
    }
    if (user.isTotpEnabled) {
      throw new BadRequestException('2FA уже активирован');
    }

    // Decrypt before verify (stored AES-256-GCM encrypted)
    const plainSecret2 = isEncrypted(user.totpSecret)
      ? decrypt(user.totpSecret)
      : user.totpSecret;

    const valid = speakeasy.totp.verify({
      secret:   plainSecret2,
      encoding: 'base32',
      token,
      window:   1,
    });

    if (!valid) {
      throw new BadRequestException('Неверный код — попробуйте ещё раз');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data:  { isTotpEnabled: true },
    });

    return { message: '2FA успешно активирован' };
  }

  // ─── 2FA: DISABLE ─────────────────────────────────────────────────────────
  async disable2fa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.isTotpEnabled || !user.totpSecret) {
      throw new BadRequestException('2FA не активирован');
    }

    // Decrypt before verify (stored AES-256-GCM encrypted)
    const plainSecret3 = isEncrypted(user.totpSecret)
      ? decrypt(user.totpSecret)
      : user.totpSecret;

    const valid = speakeasy.totp.verify({
      secret:   plainSecret3,
      encoding: 'base32',
      token,
      window:   1,
    });

    if (!valid) {
      throw new UnauthorizedException('Неверный код — 2FA не отключён');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data:  { isTotpEnabled: false, totpSecret: null },
    });

    return { message: '2FA отключён' };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  /** Генерирует UUID-токен, сохраняет в Redis и отправляет письмо-подтверждение */
  private async sendVerificationEmail(userId: string, email: string) {
    const token = randomUUID();
    await this.redis.setVerificationToken(token, userId);

    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:5173';
    const verifyUrl  = `${frontendUrl}/auth/verify?token=${token}`;

    await this.resend.emails.send({
      from: this.config.get('EMAIL_FROM') || 'onboarding@resend.dev',
      to:   email,
      subject: 'Подтвердите ваш email — SenimdiQAdam',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb;">SenimdiQAdam</h2>
          <p>Добро пожаловать! Для активации аккаунта подтвердите ваш email.</p>
          <a href="${verifyUrl}"
             style="display:inline-block; background:#2563eb; color:#fff; padding:12px 24px;
                    border-radius:6px; text-decoration:none; font-weight:bold; margin:16px 0;">
            Подтвердить email
          </a>
          <p style="color:#64748b; font-size:13px;">
            Или скопируйте ссылку в браузер:<br/>
            <a href="${verifyUrl}" style="color:#2563eb;">${verifyUrl}</a>
          </p>
          <p style="color:#64748b; font-size:13px;">
            Ссылка действительна <strong>24 часа</strong>.<br/>
            Если вы не регистрировались — проигнорируйте это письмо.
          </p>
        </div>
      `,
    });
  }

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
