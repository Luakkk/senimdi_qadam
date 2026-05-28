import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

export interface JwtPayload {
  sub: string;   // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// TTL кэша пользователя — 5 минут.
// При logout кэш инвалидируется через redis.del(`user_ctx:${userId}`).
const USER_CTX_TTL = 300;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    const cacheKey = `user_ctx:${payload.sub}`;

    // 1. Пробуем отдать из Redis (избегаем DB запрос на каждый запрос)
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. Cache miss — идём в DB, но только нужные поля (не SELECT *)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id:       true,
        email:    true,
        role:     true,
        isActive: true,
        profile: {
          select: {
            firstName: true,
            lastName:  true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Пользователь не найден или заблокирован');
    }

    // 3. Кэшируем на 5 минут — при logout инвалидируется
    await this.redis.set(cacheKey, JSON.stringify(user), USER_CTX_TTL);

    return user; // будет доступен как req.user
  }
}
