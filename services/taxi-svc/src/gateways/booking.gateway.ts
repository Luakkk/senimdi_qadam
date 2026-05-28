import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface JwtPayload {
  sub: string;
  role: string;
  isManager?: boolean;
}

interface LocationUpdateDto {
  bookingId: string;
  lat: number;
  lon: number;
}

interface SendMessageDto {
  bookingId: string;
  text: string;
}

// ─── Driver location stored in Redis ──────────────────────────────────────────
// Key: driver:{driverId}:location   Value: JSON { lat, lon, updatedAt }   TTL: 60s

const DRIVER_LOCATION_TTL = 60; // seconds (if driver goes offline, location expires)
const AVG_SPEED_KMH = 30;       // ETA calculation default speed

@WebSocketGateway({
  namespace: '/taxi',
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
      .split(',').map(o => o.trim()),
    credentials: true,
  },
})
export class BookingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(BookingGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ── Auth: verify JWT on handshake ─────────────────────────────────────────
  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`WS connection rejected — no token (${client.id})`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });
      // Store caller info on socket object for later handlers
      (client as any).userId  = payload.sub;
      (client as any).role    = payload.role;

      this.logger.log(`WS connected: user=${payload.sub} role=${payload.role} socket=${client.id}`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS disconnected: socket=${client.id}`);
  }

  // ── Event: join:booking — subscribe to a booking room ─────────────────────
  @SubscribeMessage('join:booking')
  async handleJoinBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() bookingId: string,
  ) {
    const userId = (client as any).userId as string;

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new WsException('Booking not found');

    // Only the booking owner or a manager may join the room
    const isManager = (client as any).role === 'TAXI_MANAGER' || (client as any).role === 'ADMIN';
    if (!isManager && booking.userId !== userId) {
      throw new WsException('Access denied');
    }

    await client.join(`booking:${bookingId}`);
    client.emit('joined', { bookingId });
    this.logger.log(`socket ${client.id} joined room booking:${bookingId}`);
  }

  // ── Event: message:send — real-time chat message ───────────────────────────
  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const userId    = (client as any).userId as string;
    const isManager = ['TAXI_MANAGER', 'ADMIN'].includes((client as any).role);

    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new WsException('Booking not found');

    if (!isManager && booking.userId !== userId) {
      throw new WsException('Access denied');
    }

    // Persist to DB
    const msg = await this.prisma.bookingMessage.create({
      data: {
        bookingId:  dto.bookingId,
        senderId:   userId,
        senderType: isManager ? 'MANAGER' : 'USER',
        text:       dto.text,
      },
    });

    // Broadcast to everyone in the booking room
    this.server
      .to(`booking:${dto.bookingId}`)
      .emit('message:received', msg);

    return msg;
  }

  // ── Event: driver:location_update — driver pushes GPS coords ──────────────
  @SubscribeMessage('driver:location_update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: LocationUpdateDto,
  ) {
    const userId = (client as any).userId as string;

    // Persist GPS in Redis with TTL
    const locationData = JSON.stringify({ lat: dto.lat, lon: dto.lon, updatedAt: new Date().toISOString() });
    await this.redis.set(
      `driver:${userId}:location`,
      locationData,
      DRIVER_LOCATION_TTL,
    );

    // Broadcast to the booking room so the user sees the driver move
    if (dto.bookingId) {
      this.server
        .to(`booking:${dto.bookingId}`)
        .emit('driver:location', {
          driverId:  userId,
          lat:       dto.lat,
          lon:       dto.lon,
          bookingId: dto.bookingId,
        });
    }
  }

  // ── Server-side emitter: broadcast booking status change ──────────────────
  emitBookingStatusChanged(bookingId: string, status: string, driverId?: string) {
    this.server
      .to(`booking:${bookingId}`)
      .emit('booking:status_changed', { bookingId, status, driverId });
  }
}
