import { Global, Module } from '@nestjs/common';
import { MinioService } from './minio.service';

@Global()  // MinioService доступен везде без явного импорта MinioModule
@Module({
  providers: [MinioService],
  exports:   [MinioService],
})
export class MinioModule {}
