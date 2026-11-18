import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalApiHeadersService {
  constructor(private readonly config: ConfigService) {}

  getInternalApiKey(): string {
    return this.config.getOrThrow<string>('security.internalApiKey');
  }
}
