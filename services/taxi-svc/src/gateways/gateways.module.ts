import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BookingGateway } from './booking.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [BookingGateway],
  exports:   [BookingGateway],
})
export class GatewaysModule {}
