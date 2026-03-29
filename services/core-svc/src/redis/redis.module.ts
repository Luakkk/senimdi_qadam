import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // доступен во всех модулях без импорта
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
