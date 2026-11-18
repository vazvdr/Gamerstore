import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiHeadersService {
  constructor(private readonly config: ConfigService) {}

  getHeaders(extraHeaders: Record<string, string> = {}) {
    const key = this.config.get<string>('INTERNAL_API_KEY');
    if (!key) {
      throw new Error(
        'INTERNAL_API_KEY não está configurada no API Gateway.',
      );
    }
    return {
      'x-internal-key': key,
      ...extraHeaders,
    };
  }
}
