import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const password = this.config.get<string>('REDIS_PASSWORD');
    this.client = new Redis({
      host: this.config.get('REDIS_HOST') || 'localhost',
      port: Number(this.config.get('REDIS_PORT')) || 6379,
      // Пароль — опционально (в dev может отсутствовать)
      ...(password ? { password } : {}),
      // Не падаем сразу при старте если Redis ещё не готов
      lazyConnect: true,
      // Экспоненциальная задержка: 200ms, 400ms, … max 5s
      retryStrategy: (times) => Math.min(times * 200, 5000),
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected ✓');
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  // ── Refresh tokens ────────────────────────────────────────────────────────
  async setRefreshToken(userId: string, token: string, ttlSeconds = 60 * 60 * 24 * 7) {
    await this.client.set(`refresh:${userId}`, token, 'EX', ttlSeconds);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.client.get(`refresh:${userId}`);
  }

  /**
   * Атомарно читает и удаляет refresh token (Redis GETDEL, Redis 6.2+).
   * Устраняет race condition: два одновременных запроса не могут оба успешно
   * прочитать токен до его удаления.
   */
  async getAndDeleteRefreshToken(userId: string): Promise<string | null> {
    return this.client.getdel(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string) {
    await this.client.del(`refresh:${userId}`);
  }

  // ── Служебные ─────────────────────────────────────────────────────────────
  /** PING → 'PONG'. Используется health-check контроллером. */
  async ping(): Promise<string> {
    return this.client.ping();
  }

  // ── Общие методы (для кэша профилей и т.д.) ──────────────────────────────
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }

  /**
   * Сброс кэша контекста пользователя (роль/isActive), который читает JwtStrategy.
   * ОБЯЗАТЕЛЬНО вызывать при смене роли, бане/разбане и любом изменении,
   * влияющем на доступ — иначе guard будет видеть старую роль до истечения TTL.
   */
  async invalidateUserCtx(userId: string) {
    await this.client.del(`user_ctx:${userId}`);
  }

  /** Атомарно читает и удаляет ключ (Redis GETDEL). Одноразовое чтение. */
  async getdel(key: string): Promise<string | null> {
    return this.client.getdel(key);
  }

  // ── Password reset codes ──────────────────────────────────────────────────
  async setResetCode(email: string, code: string, ttlSeconds = 60 * 15) {
    await this.client.set(`reset:${email}`, code, 'EX', ttlSeconds);
  }

  async getResetCode(email: string): Promise<string | null> {
    return this.client.get(`reset:${email}`);
  }

  /**
   * Атомарно читает и удаляет код сброса пароля (Redis GETDEL).
   * Устраняет race condition: два одновременных запроса с одним кодом
   * не смогут оба пройти валидацию до удаления.
   */
  async getAndDeleteResetCode(email: string): Promise<string | null> {
    return this.client.getdel(`reset:${email}`);
  }

  async deleteResetCode(email: string) {
    await this.client.del(`reset:${email}`);
  }

  // ── Email verification tokens ─────────────────────────────────────────────
  // key: verify:{token}  →  value: userId  (TTL 24 часа)
  async setVerificationToken(token: string, userId: string, ttlSeconds = 60 * 60 * 24) {
    await this.client.set(`verify:${token}`, userId, 'EX', ttlSeconds);
  }

  /** Атомарно читает и удаляет токен (одноразовый — повторное использование невозможно) */
  async getAndDeleteVerificationToken(token: string): Promise<string | null> {
    return this.client.getdel(`verify:${token}`);
  }
}
