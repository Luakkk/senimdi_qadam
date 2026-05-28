import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Passport-jwt уже верифицирует подпись и срок действия токена.
    // taxi-svc использует JWT выданный core-svc — пользователей в своей БД не хранит,
    // поэтому проверяем только валидность обязательных полей payload.
    if (!payload?.sub || !payload?.role) {
      throw new UnauthorizedException('Невалидный токен: отсутствуют обязательные поля');
    }
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
