import { Global, Module } from '@nestjs/common';
import { FcmService } from './fcm.service';

@Global()  // FcmService доступен везде без явного импорта FcmModule
@Module({
  providers: [FcmService],
  exports:   [FcmService],
})
export class FcmModule {}
