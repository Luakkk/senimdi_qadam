#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────────────────────
 * WebSocket поведенческие тесты taxi-svc gateway (namespace /taxi).
 * Проверяет ЖИВЫЕ события, а не только handshake:
 *   1. handshake без токена → отказ (disconnect/error)
 *   2. handshake с токеном → connected
 *   3. join:booking своей брони → событие 'joined'
 *   4. join:booking ЧУЖОЙ брони → WsException 'Access denied'
 *   5. message:send → ack-сообщение + broadcast 'message:received'
 *   6. driver:location_update → broadcast 'driver:location' в комнату
 *
 *   node docs/test_ws.js
 * Требует: socket.io-client (берём из services/taxi-svc/node_modules), node18+ (fetch).
 * core-svc :3001, taxi-svc :3002 должны быть подняты.
 * ────────────────────────────────────────────────────────────────────────── */
const path = require('path');
const io = require(path.join(__dirname, '..', 'services', 'taxi-svc', 'node_modules', 'socket.io-client')).io;

// 127.0.0.1, а не localhost: node резолвит localhost в IPv6 ::1, сервисы слушают IPv4
const CORE = 'http://127.0.0.1:3001/api';
const WS   = 'http://127.0.0.1:3002/taxi';
const PASS = 'Test1234';
const TS   = Date.now();

let P = 0, F = 0;
const ok = (m) => { P++; console.log('  ✅ ' + m); };
const no = (m) => { F++; console.log('  ❌ ' + m); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Каждый запрос — свежее соединение (Connection: close), без keep-alive пула,
// + одна повторная попытка: между запросами есть медленный docker exec, из-за
// которого keep-alive сокет успевает закрыться сервером ('other side closed').
async function http(url, opts) {
  opts = opts || {};
  opts.headers = Object.assign({ 'Content-Type': 'application/json', Connection: 'close' }, opts.headers || {});
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, opts);
      const txt = await r.text();
      return txt ? JSON.parse(txt) : {};
    } catch (e) {
      if (attempt >= 3) throw e;
      await sleep(300);
    }
  }
}
async function register(email) {
  await http(`${CORE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password: PASS, firstName: 'WS', lastName: 'Т', role: 'USER' }),
  });
  require('child_process').execSync(
    `docker exec core_db psql -U core_user -d core_db -c "UPDATE \\"User\\" SET \\"isVerified\\"=true WHERE email='${email}';"`,
    { stdio: 'ignore' });
}
async function login(email) {
  const j = await http(`${CORE}/auth/login`, { method: 'POST', body: JSON.stringify({ email, password: PASS }) });
  return j.accessToken;
}
async function createBooking(token) {
  const j = await http('http://127.0.0.1:3002/bookings', {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fromAddress: 'A', toAddress: 'B', scheduledAt: '2026-12-09T10:00:00Z', disabilityType: 'OTHER' }),
  });
  return j.id;
}
function connect(token) {
  return io(WS, { auth: token ? { token } : {}, transports: ['websocket'], reconnection: false, timeout: 4000 });
}

(async () => {
  console.log('══ WebSocket /taxi — живые события ══');
  const u1 = `ws_u1_${TS}@x.com`, u2 = `ws_u2_${TS}@x.com`;
  await register(u1); await register(u2);
  const t1 = await login(u1), t2 = await login(u2);
  const bid = await createBooking(t1);          // принадлежит u1

  // 1. без токена → отказ
  await new Promise((res) => {
    const s = connect(null);
    let settled = false;
    const done = (good, msg) => { if (settled) return; settled = true; good ? ok(msg) : no(msg); s.close(); res(); };
    s.on('connect', () => setTimeout(() => done(s.disconnected, s.disconnected ? 'без токена → отклонён' : 'без токена НЕ отклонён (дыра)'), 600));
    s.on('connect_error', () => done(true, 'без токена → connect_error (отклонён)'));
    setTimeout(() => done(s.disconnected, s.disconnected ? 'без токена → отклонён' : 'без токена остался подключён (дыра)'), 2500);
  });

  // 2. с токеном → connected
  const c1 = connect(t1);
  await new Promise((res) => {
    let done = false; const fin = () => { if (done) return; done = true; clearTimeout(t); res(); };
    const t = setTimeout(() => { no('таймаут подключения с токеном'); fin(); }, 4000);
    c1.on('connect', () => { if (done) return; ok('с токеном → connected'); fin(); });
    c1.on('connect_error', (e) => { if (done) return; no('connect_error с валидным токеном: ' + e.message); fin(); });
  });

  // 3. join своей брони → 'joined'
  await new Promise((res) => {
    let done = false;
    c1.once('joined', (d) => { if (done) return; done = true; (d.bookingId === bid) ? ok('join:booking своей → joined') : no('joined с чужим bookingId'); res(); });
    c1.once('exception', (e) => { if (done) return; done = true; no('join своей брони → exception: ' + JSON.stringify(e)); res(); });
    c1.emit('join:booking', bid);
    setTimeout(() => { if (!done) { no('нет ответа на join:booking'); res(); } }, 3000);
  });

  // 5. message:send → ack + broadcast (c1 в комнате)
  await new Promise((res) => {
    let gotBroadcast = false;
    c1.once('message:received', () => { gotBroadcast = true; });
    c1.emit('message:send', { bookingId: bid, text: 'привет по сокету' }, (ack) => {
      // ack может вернуться (Nest возвращает msg) — но не во всех версиях
    });
    setTimeout(() => { gotBroadcast ? ok('message:send → broadcast message:received') : no('broadcast message:received не пришёл'); res(); }, 2000);
  });

  // 6. driver:location_update → broadcast driver:location в комнату
  await new Promise((res) => {
    let got = false;
    c1.once('driver:location', (d) => { got = (d.bookingId === bid); });
    c1.emit('driver:location_update', { bookingId: bid, lat: 43.24, lon: 76.95 });
    setTimeout(() => { got ? ok('driver:location_update → broadcast driver:location') : no('driver:location broadcast не пришёл'); res(); }, 2000);
  });

  // 4. ЧУЖОЙ (u2) join брони u1 → 'exception' Access denied
  const c2 = connect(t2);
  await new Promise((res) => {
    c2.on('connect', () => {
      let done = false;
      c2.once('exception', (e) => { if (done) return; done = true; ok('чужой join → exception (Access denied)'); res(); });
      c2.once('joined', () => { if (done) return; done = true; no('ДЫРА: чужой вошёл в чужую комнату'); res(); });
      c2.emit('join:booking', bid);
      setTimeout(() => { if (!done) { no('чужой join — нет ответа'); res(); } }, 3000);
    });
    c2.on('connect_error', (e) => { no('u2 connect_error: ' + e.message); res(); });
    setTimeout(res, 5000);
  });

  c1.close(); c2.close();
  console.log('\n════════════════════════════════════════');
  console.log(`ИТОГ WS: ${P} passed / ${F} failed`);
  process.exit(F === 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
