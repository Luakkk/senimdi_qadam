import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  // GET /api/health — собственная проверка живости шлюза (для docker healthcheck,
  // k8s liveness и т.п.). Не проксирует никуда, отвечает локально.
  @Get()
  @ApiOperation({ summary: 'Health-check шлюза' })
  check() {
    return { status: 'ok', service: 'gateway-api' };
  }
}
