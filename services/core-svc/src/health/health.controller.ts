import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Liveness + Readiness probe.
   * Проверяет реальную связь с PostgreSQL и Redis.
   * Docker / Kubernetes healthcheck: если status !== 'ok' — контейнер помечается unhealthy.
   * HTTP 200 → всё работает, HTTP 503 → хотя бы одна зависимость недоступна.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness & readiness probe (DB + Redis)' })
  async getHealth() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const db    = checks[0].status === 'fulfilled' ? 'ok' : 'error';
    const redis = checks[1].status === 'fulfilled' ? 'ok' : 'error';

    const healthy = db === 'ok' && redis === 'ok';

    // NestJS не поддерживает динамический @HttpCode, поэтому используем res напрямую
    // через второй параметр. Вместо этого — выбрасываем HttpException при ошибке.
    if (!healthy) {
      const { ServiceUnavailableException } = await import('@nestjs/common');
      throw new ServiceUnavailableException({
        status: 'error',
        db,
        redis,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ok',
      db,
      redis,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<void> {
    // SELECT 1 — минимальный запрос, проверяет соединение с PostgreSQL
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    // PING → должен вернуть 'PONG'
    const pong = await this.redis.ping();
    if (pong !== 'PONG') throw new Error('Redis ping failed');
  }
}