import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Extracts the preferred language from the Accept-Language header.
 * Supported: 'kk' (Kazakh) | 'ru' (Russian, default).
 *
 * Sets req['lang'] so interceptors and services can read it.
 *
 * Examples:
 *   Accept-Language: kk           → 'kk'
 *   Accept-Language: kk-KZ,kk;q=0.9 → 'kk'
 *   Accept-Language: ru-RU        → 'ru'
 *   (missing)                     → 'ru'
 */
@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers['accept-language'] ?? 'ru';
    req['lang'] = header.toLowerCase().startsWith('kk') ? 'kk' : 'ru';
    next();
  }
}
