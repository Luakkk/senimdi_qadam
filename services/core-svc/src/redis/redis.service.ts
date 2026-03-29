import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.get('REDIS_HOST') || 'localhost',
      port: Number(this.config.get('REDIS_PORT')) || 6379,
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

  async deleteRefreshToken(userId: string) {
    await this.client.del(`refresh:${userId}`);
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

  // ── Password reset codes ──────────────────────────────────────────────────
  async setResetCode(email: string, code: string, ttlSeconds = 60 * 15) {
    await this.client.set(`reset:${email}`, code, 'EX', ttlSeconds);
  }

  async getResetCode(email: string): Promise<string | null> {
    return this.client.get(`reset:${email}`);
  }

  async deleteResetCode(email: string) {
    await this.client.del(`reset:${email}`);
  }
}
