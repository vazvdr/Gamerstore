
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalApiHeadersService } from '../../../../../adapters/saida/http/configuration/internal-api-headers.service';

describe('InternalApiHeadersService', () => {
  let service: InternalApiHeadersService;
  let config: ConfigService;

  beforeEach(() => {
    config = {
      getOrThrow: vi.fn().mockReturnValue('internal-key'),
    } as unknown as ConfigService;

    service = new InternalApiHeadersService(config);
  });

  it('deve retornar a chave interna configurada', () => {
    expect(service.getInternalApiKey()).toBe('internal-key');

    expect(config.getOrThrow).toHaveBeenCalledWith('security.internalApiKey');
  });

  it('deve propagar erro quando a chave interna não estiver configurada', () => {
    const error = new Error('Configuration key "security.internalApiKey" does not exist');

    vi.mocked(config.getOrThrow).mockImplementation(() => {
      throw error;
    });

    expect(() => service.getInternalApiKey()).toThrow(error);
  });
});
