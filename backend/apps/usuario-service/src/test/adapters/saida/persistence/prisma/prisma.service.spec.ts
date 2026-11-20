import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  PrismaPg: vi.fn(),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: prismaMocks.PrismaPg,
}));

vi.mock('@prisma/usuario-client', () => ({
  PrismaClient: class {
    $connect = prismaMocks.connect;
    $disconnect = prismaMocks.disconnect;

    constructor(options: unknown) {
      prismaMocks.PrismaPg(options);
    }
  },
}));

import { PrismaService } from '../../../../../adapters/saida/persistence/prisma/prisma.service';
import type { ConfigService } from '@nestjs/config';

describe('PrismaService', () => {
  let service: PrismaService;
  let config: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    config = {
      getOrThrow: vi.fn().mockReturnValue('postgresql://localhost:5432/gamerstore'),
    } as unknown as ConfigService;
    service = new PrismaService(config);
  });

  describe('constructor', () => {
    it('deve configurar o adapter PostgreSQL com a URL do banco', () => {
      expect(config.getOrThrow).toHaveBeenCalledWith('database.url');
      expect(prismaMocks.PrismaPg).toHaveBeenCalledWith({
        connectionString: 'postgresql://localhost:5432/gamerstore',
      });
    });
    it('deve propagar erro quando a configuração da URL não existir', () => {
      vi.mocked(config.getOrThrow).mockImplementation(() => {
        throw new Error('Configuração não encontrada');
      });
      expect(() => new PrismaService(config)).toThrow(
        'Configuração não encontrada',
      );
    });
  });

  describe('onModuleInit', () => {
    it('deve conectar ao banco de dados', async () => {
      await service.onModuleInit();
      expect(prismaMocks.connect).toHaveBeenCalledOnce();
    });

    it('deve propagar erros durante a conexão', async () => {
      const erro = new Error('Falha na conexão');
      prismaMocks.connect.mockRejectedValueOnce(erro);
      await expect(service.onModuleInit()).rejects.toThrow(erro);
    });
  });

  describe('onModuleDestroy', () => {
    it('deve desconectar do banco de dados', async () => {
      await service.onModuleDestroy();
      expect(prismaMocks.disconnect).toHaveBeenCalledOnce();
    });

    it('deve propagar erros durante a desconexão', async () => {
      const erro = new Error('Falha ao desconectar');
      prismaMocks.disconnect.mockRejectedValueOnce(erro);
      await expect(service.onModuleDestroy()).rejects.toThrow(erro);
    });
  });
});
