
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';
import { RabbitMQModule } from '../../../../../adapters/saida/messaging/rabbitmq/rabbitmq.module';

describe('RabbitMQModule', () => {
  let config: { getOrThrow: ReturnType<typeof vi.fn> };
  let factory: ReturnType<typeof vi.spyOn>;
  let rabbitProvider: {
    provide: string;
    useFactory?: (config: ConfigService) => Promise<unknown>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      getOrThrow: vi.fn((chave: string) => {
        if (chave === 'rabbitmq.recuperarSenhaQueue') {
          return 'usuario-recuperar-senha';
        }

        if (chave === 'rabbitmq.url') {
          return 'amqp://localhost:5672';
        }

        throw new Error(`Configuração não encontrada: ${chave}`);
      }),
    };

    factory = vi.spyOn(ClientProxyFactory, 'create').mockReturnValue(
      {} as ClientProxy,
    );

    const imports = Reflect.getMetadata(
      'imports',
      RabbitMQModule,
    ) as Array<{
      module: unknown;
      providers?: Array<{
        provide: string;
        useFactory?: (config: ConfigService) => Promise<unknown>;
      }>;
    }>;

    const clientsModule = imports.find(
      (item) => item.module === ClientsModule,
    );

    const provider = clientsModule?.providers?.find(
      (item) => item.provide === 'RABBITMQ_SERVICE',
    );

    if (!provider?.useFactory) {
      throw new Error('Provider RABBITMQ_SERVICE não encontrado.');
    }

    rabbitProvider = provider;
  });

  it('deve registrar o provider RABBITMQ_SERVICE', () => {
    expect(rabbitProvider.provide).toBe('RABBITMQ_SERVICE');
    expect(rabbitProvider.useFactory).toBeDefined();
  });

  it('deve criar o cliente RabbitMQ com as configurações corretas', async () => {
    await rabbitProvider.useFactory!(config as unknown as ConfigService);

    expect(config.getOrThrow).toHaveBeenCalledWith(
      'rabbitmq.recuperarSenhaQueue',
    );
    expect(config.getOrThrow).toHaveBeenCalledWith('rabbitmq.url');

    expect(factory).toHaveBeenCalledWith({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'usuario-recuperar-senha',
        queueOptions: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': 'usuario-recuperar-senha.dlx',
            'x-dead-letter-routing-key': 'usuario-recuperar-senha.dlq',
          },
        },
      },
    });
  });

  it('deve utilizar o nome da fila configurado para gerar as configurações DLX e DLQ', async () => {
    config.getOrThrow.mockImplementation((chave: string) => {
      if (chave === 'rabbitmq.recuperarSenhaQueue') {
        return 'fila-personalizada';
      }

      if (chave === 'rabbitmq.url') {
        return 'amqp://localhost:5672';
      }

      throw new Error(`Configuração não encontrada: ${chave}`);
    });

    await rabbitProvider.useFactory!(config as unknown as ConfigService);

    expect(factory).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          queue: 'fila-personalizada',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'fila-personalizada.dlx',
              'x-dead-letter-routing-key': 'fila-personalizada.dlq',
            },
          },
        }),
      }),
    );
  });

  it('deve propagar erro quando a configuração da fila não existir', async () => {
    config.getOrThrow.mockImplementation(() => {
      throw new Error('Configuração da fila não encontrada');
    });

    await expect(
      rabbitProvider.useFactory!(config as unknown as ConfigService),
    ).rejects.toThrow('Configuração da fila não encontrada');

    expect(factory).not.toHaveBeenCalled();
  });

  it('deve propagar erro quando a URL do RabbitMQ não existir', async () => {
    config.getOrThrow.mockImplementation((chave: string) => {
      if (chave === 'rabbitmq.recuperarSenhaQueue') {
        return 'usuario-recuperar-senha';
      }

      throw new Error('URL do RabbitMQ não encontrada');
    });

    await expect(
      rabbitProvider.useFactory!(config as unknown as ConfigService),
    ).rejects.toThrow('URL do RabbitMQ não encontrada');

    expect(factory).not.toHaveBeenCalled();
  });

  it('deve exportar o ClientsModule', () => {
    const exports = Reflect.getMetadata('exports', RabbitMQModule);

    expect(exports).toContain(ClientsModule);
  });
});
