import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { ProxyService } from './proxy.service';

const mockHttp = { request: jest.fn() };

// ConfigService.get(key, default) — отдаём дефолт (как при отсутствии env)
const mockConfig = {
  get: jest.fn((key: string, def?: string) => def),
};

function httpResponse(status: number, data: any) {
  return of({ status, data } as any);
}

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        { provide: HttpService,   useValue: mockHttp },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<ProxyService>(ProxyService);
  });

  describe('getBaseUrl', () => {
    it('should return the default upstream urls', () => {
      expect(service.getBaseUrl('core')).toBe('http://localhost:3001');
      expect(service.getBaseUrl('taxi')).toBe('http://localhost:3002');
      expect(service.getBaseUrl('ai')).toBe('http://localhost:8000');
    });
  });

  describe('forward', () => {
    it('should build the full upstream url and return status+data', async () => {
      mockHttp.request.mockReturnValue(httpResponse(200, { ok: true }));

      const result = await service.forward('core', '/organizations?limit=20', 'GET');

      expect(result).toEqual({ status: 200, data: { ok: true } });
      const callArgs = mockHttp.request.mock.calls[0][0];
      expect(callArgs.url).toBe('http://localhost:3001/organizations?limit=20');
      expect(callArgs.method).toBe('GET');
    });

    it('should pass through the authorization header', async () => {
      mockHttp.request.mockReturnValue(httpResponse(200, {}));
      await service.forward('core', '/me', 'GET', undefined, {
        authorization: 'Bearer tok', 'x-user-id': 'u1',
      });
      const callArgs = mockHttp.request.mock.calls[0][0];
      expect(callArgs.headers.authorization).toBe('Bearer tok');
      expect(callArgs.headers['x-user-id']).toBe('u1');
    });

    it('should default content-type to application/json for non-multipart', async () => {
      mockHttp.request.mockReturnValue(httpResponse(201, {}));
      await service.forward('core', '/news', 'POST', { title: 'x' });
      const callArgs = mockHttp.request.mock.calls[0][0];
      expect(callArgs.headers['content-type']).toBe('application/json');
    });

    it('should NOT override content-type for multipart requests', async () => {
      mockHttp.request.mockReturnValue(httpResponse(200, {}));
      await service.forward('ai', '/speech/stt', 'POST', {}, {
        'content-type': 'multipart/form-data; boundary=xyz',
      });
      const callArgs = mockHttp.request.mock.calls[0][0];
      expect(callArgs.headers['content-type']).toBeUndefined();
    });

    it('should omit body when empty', async () => {
      mockHttp.request.mockReturnValue(httpResponse(200, {}));
      await service.forward('core', '/ping', 'GET', {});
      const callArgs = mockHttp.request.mock.calls[0][0];
      expect(callArgs.data).toBeUndefined();
    });

    it('should send the body when present', async () => {
      mockHttp.request.mockReturnValue(httpResponse(200, {}));
      await service.forward('core', '/login', 'POST', { email: 'a@b.kz' });
      const callArgs = mockHttp.request.mock.calls[0][0];
      expect(callArgs.data).toEqual({ email: 'a@b.kz' });
    });

    it('should use a 120s timeout for speech routes', async () => {
      mockHttp.request.mockReturnValue(httpResponse(200, {}));
      await service.forward('ai', '/speech/tts', 'POST', { text: 'привет' });
      expect(mockHttp.request.mock.calls[0][0].timeout).toBe(120_000);
    });

    it('should use a 30s timeout for normal routes', async () => {
      mockHttp.request.mockReturnValue(httpResponse(200, {}));
      await service.forward('core', '/organizations', 'GET');
      expect(mockHttp.request.mock.calls[0][0].timeout).toBe(30_000);
    });

    it('should pass through non-2xx statuses without throwing', async () => {
      mockHttp.request.mockReturnValue(httpResponse(404, { message: 'not found' }));
      const result = await service.forward('core', '/missing', 'GET');
      expect(result.status).toBe(404);
      // validateStatus всегда true — gateway не падает на ошибках upstream
      expect(mockHttp.request.mock.calls[0][0].validateStatus()).toBe(true);
    });
  });
});
