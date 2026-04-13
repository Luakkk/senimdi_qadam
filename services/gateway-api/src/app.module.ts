import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProxyModule } from './proxy/proxy.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ProxyModule,
    AdminModule.forRoot(),   // AdminJS — единая панель на /admin
  ],
})
export class AppModule {}
