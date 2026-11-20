
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../../adapters/saida/persistence/prisma/prisma.service';

describe('PrismaService', () => {
  afterEach(() => vi.restoreAllMocks());

  const criarConfig = () => ({
    getOrThrow: vi.fn().mockReturnValue('postgresql://user:password@localhost:5432/gamerstore?schema=public'),
  });

  it('deve obter a URL de conexão do banco de dados na configuração', () => {
    const config = criarConfig();

    new PrismaService(config as unknown as ConfigService);

    expect(config.getOrThrow).toHaveBeenCalledOnce();
    expect(config.getOrThrow).toHaveBeenCalledWith('database.url');
  });

  it('deve conectar ao banco de dados ao inicializar o módulo', async () => {
    const service = new PrismaService(criarConfig() as unknown as ConfigService);
    const connectSpy = vi.spyOn(service, '$connect').mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledOnce();
  });

  it('deve desconectar do banco de dados ao destruir o módulo', async () => {
    const service = new PrismaService(criarConfig() as unknown as ConfigService);
    const disconnectSpy = vi.spyOn(service, '$disconnect').mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledOnce();
  });

  it('deve propagar erros durante a conexão com o banco de dados', async () => {
    const service = new PrismaService(criarConfig() as unknown as ConfigService);
    const error = new Error('Erro ao conectar ao banco de dados');

    vi.spyOn(service, '$connect').mockRejectedValue(error);

    await expect(service.onModuleInit()).rejects.toThrow(error);
  });

  it('deve propagar erros durante a desconexão do banco de dados', async () => {
    const service = new PrismaService(criarConfig() as unknown as ConfigService);
    const error = new Error('Erro ao desconectar do banco de dados');

    vi.spyOn(service, '$disconnect').mockRejectedValue(error);

    await expect(service.onModuleDestroy()).rejects.toThrow(error);
  });
});
