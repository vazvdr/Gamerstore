
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RabbitMQService } from '../../../../../adapters/entrada/messaging/rabbitmq/rabbitmq.service';

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
}));

vi.mock('amqplib', () => ({
  connect: mocks.connect,
}));

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let config: { getOrThrow: ReturnType<typeof vi.fn> };
  let channel: { close: ReturnType<typeof vi.fn> };
  let connection: {
    createChannel: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };
  let listeners: Map<string, (error?: Error) => void>;

  beforeEach(() => {
    vi.clearAllMocks();

    listeners = new Map();

    config = {
      getOrThrow: vi.fn().mockReturnValue('amqp://localhost'),
    };

    channel = {
      close: vi.fn().mockResolvedValue(undefined),
    };

    connection = {
      createChannel: vi.fn().mockResolvedValue(channel),
      on: vi.fn((event: string, listener: (error?: Error) => void) => {
        listeners.set(event, listener);
      }),
      close: vi.fn().mockResolvedValue(undefined),
    };

    mocks.connect.mockResolvedValue(connection);

    service = new RabbitMQService(config as never);
  });

  it('deve conectar ao RabbitMQ e criar um canal', async () => {
    const result = await service.getChannel();

    expect(config.getOrThrow).toHaveBeenCalledWith('rabbitmq.url');
    expect(mocks.connect).toHaveBeenCalledWith('amqp://localhost');
    expect(connection.createChannel).toHaveBeenCalledOnce();
    expect(result).toBe(channel);
  });

  it('deve reutilizar o canal já criado', async () => {
    const firstChannel = await service.getChannel();
    const secondChannel = await service.getChannel();

    expect(firstChannel).toBe(secondChannel);
    expect(mocks.connect).toHaveBeenCalledOnce();
    expect(connection.createChannel).toHaveBeenCalledOnce();
  });

  it('deve registrar os listeners de erro e encerramento da conexão', async () => {
    await service.getChannel();

    expect(connection.on).toHaveBeenCalledTimes(2);
    expect(listeners.has('error')).toBe(true);
    expect(listeners.has('close')).toBe(true);
  });

  it('deve registrar o erro emitido pela conexão', async () => {
    await service.getChannel();

    const error = new Error('Falha na conexão');

    expect(() => listeners.get('error')?.(error)).not.toThrow();
  });

  it('deve limpar a conexão e o canal quando a conexão for encerrada', async () => {
    await service.getChannel();

    listeners.get('close')?.();

    await service.getChannel();

    expect(mocks.connect).toHaveBeenCalledTimes(2);
    expect(connection.createChannel).toHaveBeenCalledTimes(2);
  });

  it('deve propagar erro ao tentar conectar', async () => {
    const error = new Error('Falha ao conectar');
    mocks.connect.mockRejectedValueOnce(error);

    await expect(service.getChannel()).rejects.toThrow(error);
  });

  it('deve propagar erro ao criar o canal', async () => {
    const error = new Error('Falha ao criar canal');
    connection.createChannel.mockRejectedValueOnce(error);

    await expect(service.getChannel()).rejects.toThrow(error);
  });

  it('deve fechar o canal e a conexão ao destruir o módulo', async () => {
    await service.getChannel();

    await service.onModuleDestroy();

    expect(channel.close).toHaveBeenCalledOnce();
    expect(connection.close).toHaveBeenCalledOnce();
  });

  it('deve continuar o encerramento mesmo se o fechamento do canal falhar', async () => {
    channel.close.mockRejectedValueOnce(new Error('Falha ao fechar canal'));

    await service.getChannel();
    await service.onModuleDestroy();

    expect(channel.close).toHaveBeenCalledOnce();
    expect(connection.close).toHaveBeenCalledOnce();
  });

  it('deve ignorar erro ao fechar a conexão', async () => {
    connection.close.mockRejectedValueOnce(new Error('Falha ao fechar conexão'));

    await service.getChannel();

    await expect(service.onModuleDestroy()).resolves.toBeUndefined();

    expect(channel.close).toHaveBeenCalledOnce();
    expect(connection.close).toHaveBeenCalledOnce();
  });

  it('não deve tentar fechar recursos se nenhuma conexão foi criada', async () => {
    await expect(service.onModuleDestroy()).resolves.toBeUndefined();

    expect(channel.close).not.toHaveBeenCalled();
    expect(connection.close).not.toHaveBeenCalled();
  });
});
