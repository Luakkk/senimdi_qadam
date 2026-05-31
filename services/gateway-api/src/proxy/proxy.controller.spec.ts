import { Test, TestingModule } from '@nestjs/testing';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

const mockProxy = {
  forward: jest.fn().mockResolvedValue({ status: 200, data: { ok: true } }),
};

function fakeRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('ProxyController', () => {
  let controller: ProxyController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [{ provide: ProxyService, useValue: mockProxy }],
    }).compile();
    controller = module.get<ProxyController>(ProxyController);
  });

  it('should strip the /core prefix and forward to core-svc', async () => {
    const req: any = { url: '/core/organizations?limit=20', method: 'GET', body: {}, headers: { authorization: 'Bearer t' } };
    const res = fakeRes();

    await controller.proxyCore(req, res);

    expect(mockProxy.forward).toHaveBeenCalledWith(
      'core', '/organizations?limit=20', 'GET', {}, { authorization: 'Bearer t' },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('should strip the /taxi prefix and forward to taxi-svc', async () => {
    const req: any = { url: '/taxi/bookings', method: 'POST', body: { fromAddress: 'A' }, headers: {} };
    const res = fakeRes();

    await controller.proxyTaxi(req, res);

    expect(mockProxy.forward).toHaveBeenCalledWith(
      'taxi', '/bookings', 'POST', { fromAddress: 'A' }, {},
    );
  });

  it('should strip the /ai prefix and forward to ai-svc', async () => {
    const req: any = { url: '/ai/chat/sessions', method: 'GET', body: {}, headers: {} };
    const res = fakeRes();

    await controller.proxyAi(req, res);

    expect(mockProxy.forward).toHaveBeenCalledWith(
      'ai', '/chat/sessions', 'GET', {}, {},
    );
  });

  it('should map a bare prefix to root path "/"', async () => {
    const req: any = { url: '/core', method: 'GET', body: {}, headers: {} };
    const res = fakeRes();

    await controller.proxyCore(req, res);

    expect(mockProxy.forward).toHaveBeenCalledWith('core', '/', 'GET', {}, {});
  });

  it('should relay the upstream status code', async () => {
    mockProxy.forward.mockResolvedValueOnce({ status: 403, data: { message: 'forbidden' } });
    const req: any = { url: '/core/admin', method: 'GET', body: {}, headers: {} };
    const res = fakeRes();

    await controller.proxyCore(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'forbidden' });
  });
});
