import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('GET /api/health → {status: ok, service: gateway-api}', () => {
    const controller = new HealthController();
    expect(controller.check()).toEqual({ status: 'ok', service: 'gateway-api' });
  });
});
