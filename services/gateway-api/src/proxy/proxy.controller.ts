import { Controller, All, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@ApiTags('Proxy')
@Controller()
export class ProxyController {
  constructor(private proxy: ProxyService) {}

  // Префикс пути НА СТОРОНЕ UPSTREAM (не путать с маршрутом шлюза):
  //   • core-svc поднят с globalPrefix('api') → слушает на /api/*
  //   • taxi-svc и ai-svc — без префикса        → слушают на /*
  // Поэтому при проксировании core мы ДОЛЖНЫ сохранить /api, а для taxi/ai — убрать.
  private static readonly UPSTREAM_PREFIX: Record<string, string> = {
    core: '/api',
    taxi: '',
    ai: '',
  };

  // Снимаем маршрут шлюза (/api/core, /api/taxi, /api/ai) и подставляем
  // собственный префикс upstream-сервиса. Сохраняем путь + query string.
  //   /api/core/auth/register  → /api/auth/register   (core: globalPrefix 'api')
  //   /api/taxi/bookings       → /bookings            (taxi: без префикса)
  //   /api/ai/chat/guide       → /chat/guide          (ai:   без префикса)
  private extractPath(url: string, prefix: string): string {
    // ВАЖНО: NestJS НЕ срезает globalPrefix('api') из req.url, поэтому
    // снимаем опциональный /api вместе с маршрутом сервиса.
    const rest = url.replace(new RegExp(`^(?:\\/api)?\\/${prefix}`), '') || '/';
    const tail = rest.startsWith('/') ? rest : `/${rest}`;
    return `${ProxyController.UPSTREAM_PREFIX[prefix] ?? ''}${tail}`;
  }

  // ─── core-svc :3001 ───────────────────────────────────────────────────────
  @All('core/*')
  @ApiOperation({ summary: 'Прокси → core-svc :3001 (авторизация, организации, новости...)' })
  async proxyCore(@Req() req: Request, @Res() res: Response) {
    const path = this.extractPath(req.url, 'core');
    const { status, data } = await this.proxy.forward(
      'core', path, req.method, req.body, req.headers,
    );
    return res.status(status).json(data);
  }

  // ─── taxi-svc :3002 ───────────────────────────────────────────────────────
  @All('taxi/*')
  @ApiOperation({ summary: 'Прокси → taxi-svc :3002 (ИнваТакси: заявки, водители, чат)' })
  async proxyTaxi(@Req() req: Request, @Res() res: Response) {
    const path = this.extractPath(req.url, 'taxi');
    const { status, data } = await this.proxy.forward(
      'taxi', path, req.method, req.body, req.headers,
    );
    return res.status(status).json(data);
  }

  // ─── ai-svc :8000 ────────────────────────────────────────────────────────
  @All('ai/*')
  @ApiOperation({ summary: 'Прокси → ai-svc :8000 (AI-ассистент Сенім, STT/TTS, сессии)' })
  async proxyAi(@Req() req: Request, @Res() res: Response) {
    const path = this.extractPath(req.url, 'ai');
    const { status, data } = await this.proxy.forward(
      'ai', path, req.method, req.body, req.headers,
    );
    return res.status(status).json(data);
  }
}
