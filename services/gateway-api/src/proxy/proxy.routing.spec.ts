import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AddressInfo } from 'net';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

/**
 * HTTP-уровневый E2E для gateway: поднимаем реальный Nest/Express сервер
 * (только ProxyModule, без AdminJS/БД) с тем же globalPrefix('api') и
 * ValidationPipe, что и в проде. HttpService замокан и «эхом» возвращает
 * параметры upstream-вызова — так проверяем РЕАЛЬНЫЙ роутинг через Express:
 * срез префикса /core|/taxi|/ai, проброс метода/тела/заголовков и статуса.
 */
describe('Gateway proxy routing (e2e, HTTP-слой)', () => {
  let app: INestApplication;
  let baseUrl: string;
  const request = jest.fn();

  beforeAll(async () => {
    // Мок HttpService: эхо — отдаём 200 и тело с тем, что получил forward()
    request.mockImplementation((cfg: any) =>
      of({
        status: 200,
        data: { url: cfg.url, method: cfg.method, data: cfg.data ?? null, headers: cfg.headers },
      } as any),
    );

    const moduleRef = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        ProxyService,
        { provide: HttpService, useValue: { request } },
        { provide: ConfigService, useValue: { get: (_k: string, def?: string) => def } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api');
    await app.listen(0);

    const port = (app.getHttpServer().address() as AddressInfo).port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/core/* → срез префикса, upstream core-svc', async () => {
    const res = await fetch(`${baseUrl}/api/core/organizations?limit=20`, {
      headers: { authorization: 'Bearer t' },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    // core-svc слушает с globalPrefix('api') → /api сохраняется, срезается только /core
    expect(body.url).toBe('http://localhost:3001/api/organizations?limit=20');
    expect(body.method).toBe('GET');
    expect(body.headers.authorization).toBe('Bearer t');
  });

  it('POST /api/taxi/* → проброс тела и метода на taxi-svc', async () => {
    const res = await fetch(`${baseUrl}/api/taxi/bookings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fromAddress: 'A' }),
    });
    const body = await res.json();
    expect(body.url).toBe('http://localhost:3002/bookings');
    expect(body.method).toBe('POST');
    expect(body.data).toEqual({ fromAddress: 'A' });
  });

  it('GET /api/ai/* → upstream ai-svc :8000', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat/sessions`);
    const body = await res.json();
    expect(body.url).toBe('http://localhost:8000/chat/sessions');
  });

  it('пробрасывает upstream-статус как есть (404)', async () => {
    request.mockImplementationOnce(() => of({ status: 404, data: { message: 'not found' } } as any));
    const res = await fetch(`${baseUrl}/api/core/missing`);
    expect(res.status).toBe(404);
    expect((await res.json()).message).toBe('not found');
  });

  it('пробрасывает upstream-статус как есть (403)', async () => {
    request.mockImplementationOnce(() => of({ status: 403, data: { message: 'forbidden' } } as any));
    const res = await fetch(`${baseUrl}/api/core/admin/users`);
    expect(res.status).toBe(403);
  });

  it('неизвестный префикс /api/unknown → 404 (нет роута)', async () => {
    const res = await fetch(`${baseUrl}/api/unknown/x`);
    expect(res.status).toBe(404);
  });
});
