import { Controller, All, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@ApiTags('Proxy')
@Controller()
export class ProxyController {
  constructor(private proxy: ProxyService) {}

  // Вырезаем префикс (/core, /taxi, /ai) и сохраняем путь + query string
  // Пример: /core/organizations?limit=20  →  /organizations?limit=20
  private extractPath(url: string, prefix: string): string {
    // url приходит без /api (globalPrefix уже снят NestJS)
    const cut = url.replace(new RegExp(`^\\/${prefix}`), '') || '/';
    return cut.startsWith('/') ? cut : `/${cut}`;
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
