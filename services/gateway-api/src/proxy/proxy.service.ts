import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly urls: Record<'core' | 'taxi' | 'ai', string>;

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.urls = {
      core: config.get('CORE_SVC_URL', 'http://localhost:3001'),
      taxi: config.get('TAXI_SVC_URL', 'http://localhost:3002'),
      ai:   config.get('AI_SVC_URL',   'http://localhost:8000'),
    };
  }

  getBaseUrl(svc: 'core' | 'taxi' | 'ai'): string {
    return this.urls[svc];
  }

  // fullPath уже содержит query string: /organizations?limit=20&city=Алматы
  async forward(
    svc: 'core' | 'taxi' | 'ai',
    fullPath: string,
    method: string,
    body?: any,
    headers?: any,
  ): Promise<{ status: number; data: any }> {
    const url = `${this.urls[svc]}${fullPath}`;

    const forwardHeaders: Record<string, string> = {};
    // Пробрасываем авторизацию
    if (headers?.authorization)   forwardHeaders['authorization']   = headers.authorization;
    if (headers?.['x-user-id'])   forwardHeaders['x-user-id']       = headers['x-user-id'];
    // Content-Type только для не-multipart запросов (multipart идёт через raw proxy)
    if (!headers?.['content-type']?.includes('multipart')) {
      forwardHeaders['content-type'] = 'application/json';
    }

    const response = await firstValueFrom(
      this.http.request({
        url,
        method,
        data: body && Object.keys(body).length ? body : undefined,
        headers: forwardHeaders,
        // validateStatus: всегда true — не выбрасываем ошибку на 4xx/5xx,
        // пробрасываем статус как есть на фронтенд
        validateStatus: () => true,
      }),
    );

    return { status: response.status, data: response.data };
  }
}
