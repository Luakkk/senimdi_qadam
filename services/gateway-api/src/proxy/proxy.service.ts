import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly coreSvcUrl: string;
  private readonly taxiSvcUrl: string;
  private readonly aiSvcUrl: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.coreSvcUrl = config.get('CORE_SVC_URL');
    this.taxiSvcUrl = config.get('TAXI_SVC_URL');
    this.aiSvcUrl   = config.get('AI_SVC_URL');
  }

  async forward(svc: 'core' | 'taxi' | 'ai', path: string, method: string, body?: any, headers?: any) {
    const baseUrl = svc === 'core' ? this.coreSvcUrl
                  : svc === 'taxi' ? this.taxiSvcUrl
                  : this.aiSvcUrl;

    const url = `${baseUrl}${path}`;
    const forwardHeaders = {
      'Content-Type': 'application/json',
      ...(headers?.authorization ? { authorization: headers.authorization } : {}),
    };

    const response = await firstValueFrom(
      this.http.request({ url, method, data: body, headers: forwardHeaders }),
    );
    return response.data;
  }
}
