import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { signToken } from './helpers';

/**
 * Реалтайм через WebSocket (Socket.IO, namespace /taxi):
 * аутентификация на handshake, вступление в комнату брони, обмен
 * сообщениями в реальном времени. Поднимаем настоящий io-сервер и
 * подключаемся настоящим io-клиентом.
 */
describe('WebSocket gateway (e2e) — realtime чат и комнаты', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let url: string;

  const USER_ID = '88888888-8888-8888-8888-888888888888';
  const userToken = signToken('USER', USER_ID);
  let bookingId: string;

  const sockets: Socket[] = [];
  const connect = (token?: string): Socket => {
    const s = io(`${url}/taxi`, {
      transports: ['websocket'],
      forceNew: true,
      ...(token ? { auth: { token } } : {}),
    });
    sockets.push(s);
    return s;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.init();
    await app.listen(0);

    const server = app.getHttpServer();
    const port = server.address().port;
    url = `http://localhost:${port}`;

    prisma = app.get(PrismaService);
    const booking = await prisma.booking.create({
      data: {
        userId: USER_ID,
        fromAddress: 'A',
        toAddress: 'B',
        scheduledAt: new Date('2026-12-10T10:00:00Z'),
        disabilityType: 'WHEELCHAIR',
        status: 'PENDING',
      },
    });
    bookingId = booking.id;
  });

  afterAll(async () => {
    for (const s of sockets) s.disconnect();
    await prisma.bookingMessage.deleteMany({ where: { bookingId } }).catch(() => undefined);
    await prisma.booking.deleteMany({ where: { id: bookingId } }).catch(() => undefined);
    await app.close();
  });

  it('подключение с валидным токеном → connect', async () => {
    const s = connect(userToken);
    await new Promise<void>((resolve, reject) => {
      s.on('connect', () => resolve());
      s.on('connect_error', (e) => reject(e));
      setTimeout(() => reject(new Error('timeout connect')), 4000);
    });
    expect(s.connected).toBe(true);
  });

  it('join:booking владельцем → событие joined', async () => {
    const s = connect(userToken);
    await new Promise<void>((resolve) => s.on('connect', () => resolve()));

    const joined = await new Promise<any>((resolve, reject) => {
      s.on('joined', (p) => resolve(p));
      s.emit('join:booking', bookingId);
      setTimeout(() => reject(new Error('timeout joined')), 4000);
    });
    expect(joined.bookingId).toBe(bookingId);
  });

  it('message:send → message:received транслируется в комнату + сохраняется в БД', async () => {
    const s = connect(userToken);
    await new Promise<void>((resolve) => s.on('connect', () => resolve()));
    await new Promise<void>((resolve) => {
      s.on('joined', () => resolve());
      s.emit('join:booking', bookingId);
    });

    const received = await new Promise<any>((resolve, reject) => {
      s.on('message:received', (m) => resolve(m));
      s.emit('message:send', { bookingId, text: 'Привет по WS' });
      setTimeout(() => reject(new Error('timeout message')), 4000);
    });
    expect(received.text).toBe('Привет по WS');
    expect(received.senderType).toBe('USER');

    const inDb = await prisma.bookingMessage.findFirst({ where: { bookingId, text: 'Привет по WS' } });
    expect(inDb).not.toBeNull();
  });

  it('подключение без токена → отклонено (error/disconnect)', async () => {
    const s = connect(); // без auth.token
    const rejected = await new Promise<boolean>((resolve) => {
      s.on('error', () => resolve(true));
      s.on('disconnect', () => resolve(true));
      setTimeout(() => resolve(false), 4000);
    });
    expect(rejected).toBe(true);
  });
});
