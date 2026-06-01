import { FcmService } from './fcm.service';

/**
 * FCM — обёртка над Firebase Admin SDK. Без FIREBASE_*-переменных сервис
 * остаётся неинициализированным и все отправки должны быть безопасными
 * no-op (не бросать исключений), чтобы не ронять основной flow брони.
 */
describe('FcmService', () => {
  const ENV = process.env;

  afterEach(() => {
    process.env = ENV;
  });

  it('onModuleInit без FIREBASE_* → не инициализируется', () => {
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;

    const svc = new FcmService();
    expect(() => svc.onModuleInit()).not.toThrow();
    expect((svc as any).initialized).toBe(false);
  });

  it('send() в неинициализированном состоянии → no-op, без ошибок', async () => {
    const svc = new FcmService();
    await expect(svc.send('some-token', { title: 't', body: 'b' })).resolves.toBeUndefined();
  });

  it('sendMulticast() без токенов → no-op', async () => {
    const svc = new FcmService();
    await expect(svc.sendMulticast([], { title: 't', body: 'b' })).resolves.toBeUndefined();
  });

  it('send() с пустым токеном → no-op', async () => {
    const svc = new FcmService();
    await expect(svc.send('', { title: 't', body: 'b' })).resolves.toBeUndefined();
  });
});
