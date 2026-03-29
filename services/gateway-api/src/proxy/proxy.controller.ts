import { Controller, All, Req, Res, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@ApiTags('Proxy')
@Controller()
export class ProxyController {
  constructor(private proxy: ProxyService) {}

  // /api/core/** → core-svc:3001
  @All('core/*path')
  @ApiOperation({ summary: 'Прокси → core-svc (авторизация, организации, пользователи)' })
  async proxyCore(@Req() req: Request, @Res() res: Response, @Param('path') path: string) {
    try {
      const data = await this.proxy.forward('core', `/${path}`, req.method, req.body, req.headers);
      return res.json(data);
    } catch (e: any) {
      return res.status(e.response?.status || 500).json(e.response?.data || { message: e.message });
    }
  }

  // /api/taxi/** → taxi-svc:3002
  @All('taxi/*path')
  @ApiOperation({ summary: 'Прокси → taxi-svc (бронирование, водители)' })
  async proxyTaxi(@Req() req: Request, @Res() res: Response, @Param('path') path: string) {
    try {
      const data = await this.proxy.forward('taxi', `/${path}`, req.method, req.body, req.headers);
      return res.json(data);
    } catch (e: any) {
      return res.status(e.response?.status || 500).json(e.response?.data || { message: e.message });
    }
  }

  // /api/ai/** → ai-svc:8000
  @All('ai/*path')
  @ApiOperation({ summary: 'Прокси → ai-svc (RAG, STT/TTS)' })
  async proxyAi(@Req() req: Request, @Res() res: Response, @Param('path') path: string) {
    try {
      const data = await this.proxy.forward('ai', `/${path}`, req.method, req.body, req.headers);
      return res.json(data);
    } catch (e: any) {
      return res.status(e.response?.status || 500).json(e.response?.data || { message: e.message });
    }
  }
}
