import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Channel, ConsumeMessage } from 'amqplib';
import { RecuperarSenhaConsumer } from '../../../../../../adapters/entrada/messaging/rabbitmq/consumers/recuperar-senha.consumer';
import { RabbitMQService } from '../../../../../../adapters/entrada/messaging/rabbitmq/rabbitmq.service';
import { EnviarEmailRecuperacaoSenhaUseCase } from '../../../../../../application/usecases/enviar-email-recuperacao-senha.usecase';
import { ConfigService } from '@nestjs/config';

describe('RecuperarSenhaConsumer', () => {
  let consumer: RecuperarSenhaConsumer;
  let channel: {
    assertExchange: ReturnType<typeof vi.fn>;
    assertQueue: ReturnType<typeof vi.fn>;
    bindQueue: ReturnType<typeof vi.fn>;
    prefetch: ReturnType<typeof vi.fn>;
    consume: ReturnType<typeof vi.fn>;
    ack: ReturnType<typeof vi.fn>;
    nack: ReturnType<typeof vi.fn>;
  };
  let config: { get: ReturnType<typeof vi.fn> };
  let rabbitMQ: { getChannel: ReturnType<typeof vi.fn> };
  let enviarEmail: { execute: ReturnType<typeof vi.fn> };
  let callbackMensagem: ((message: ConsumeMessage | null) => void) | undefined;

  const dados = {
    usuarioId: 'usuario-123',
    nome: 'Joazinho',
    email: 'joazinho@example.com',
    link: 'https://gamerstore.com/redefinir-senha/token',
  };

  const criarMensagem = (conteudo: unknown): ConsumeMessage =>
    ({
      content: Buffer.from(
        typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo),
      ),
    }) as ConsumeMessage;

  beforeEach(() => {
    vi.clearAllMocks();

    callbackMensagem = undefined;

    channel = {
      assertExchange: vi.fn().mockResolvedValue(undefined),
      assertQueue: vi.fn().mockResolvedValue(undefined),
      bindQueue: vi.fn().mockResolvedValue(undefined),
      prefetch: vi.fn().mockResolvedValue(undefined),
      consume: vi.fn().mockImplementation((_queue, callback) => {
        callbackMensagem = callback;
        return Promise.resolve(undefined);
      }),
      ack: vi.fn(),
      nack: vi.fn(),
    };

    config = {
      get: vi.fn().mockReturnValue('usuario-recuperar-senha'),
    };

    rabbitMQ = {
      getChannel: vi.fn().mockResolvedValue(channel),
    };

    enviarEmail = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    consumer = new RecuperarSenhaConsumer(
      rabbitMQ as unknown as RabbitMQService,
      config as unknown as ConfigService,
      enviarEmail as unknown as EnviarEmailRecuperacaoSenhaUseCase,
    );
  });

  it('deve configurar a fila principal, DLX e DLQ', async () => {
    await consumer.onModuleInit();

    expect(rabbitMQ.getChannel).toHaveBeenCalledOnce();
    expect(channel.assertExchange).toHaveBeenCalledWith(
      'usuario-recuperar-senha.dlx',
      'direct',
      { durable: true },
    );
    expect(channel.assertQueue).toHaveBeenNthCalledWith(
      1,
      'usuario-recuperar-senha.dlq',
      { durable: true },
    );
    expect(channel.bindQueue).toHaveBeenCalledWith(
      'usuario-recuperar-senha.dlq',
      'usuario-recuperar-senha.dlx',
      'usuario-recuperar-senha.dlq',
    );
    expect(channel.assertQueue).toHaveBeenNthCalledWith(
      2,
      'usuario-recuperar-senha',
      {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'usuario-recuperar-senha.dlx',
          'x-dead-letter-routing-key': 'usuario-recuperar-senha.dlq',
        },
      },
    );
    expect(channel.prefetch).toHaveBeenCalledWith(1);
    expect(channel.consume).toHaveBeenCalledWith(
      'usuario-recuperar-senha',
      expect.any(Function),
    );
  });

  it('deve utilizar o nome padrão da fila quando não houver configuração', async () => {
    config.get.mockReturnValue('usuario-recuperar-senha');

    await consumer.onModuleInit();

    expect(channel.consume).toHaveBeenCalledWith(
      'usuario-recuperar-senha',
      expect.any(Function),
    );
  });

  it('deve consumir uma mensagem válida e confirmar seu processamento', async () => {
    await consumer.onModuleInit();

    const mensagem = criarMensagem({
      pattern: 'usuario-recuperar-senha',
      data: dados,
    });

    callbackMensagem?.(mensagem);

    await vi.waitFor(() => {
      expect(enviarEmail.execute).toHaveBeenCalledWith({
        nome: dados.nome,
        email: dados.email,
        link: dados.link,
      });
      expect(channel.ack).toHaveBeenCalledWith(mensagem);
    });
  });

  it('deve ignorar mensagens nulas recebidas pelo consumer', async () => {
    await consumer.onModuleInit();

    callbackMensagem?.(null);

    expect(enviarEmail.execute).not.toHaveBeenCalled();
    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('deve encaminhar para DLQ quando o JSON for inválido', async () => {
    await consumer.onModuleInit();

    const mensagem = criarMensagem('{json-invalido');

    callbackMensagem?.(mensagem);

    expect(channel.nack).toHaveBeenCalledWith(mensagem, false, false);
    expect(enviarEmail.execute).not.toHaveBeenCalled();
  });

  it('deve encaminhar para DLQ quando o evento tiver pattern inválido', async () => {
    await consumer.onModuleInit();

    const mensagem = criarMensagem({
      pattern: 'evento-invalido',
      data: dados,
    });

    callbackMensagem?.(mensagem);

    expect(channel.nack).toHaveBeenCalledWith(mensagem, false, false);
    expect(enviarEmail.execute).not.toHaveBeenCalled();
  });

  it.each(['usuarioId', 'nome', 'email', 'link'])(
    'deve encaminhar para DLQ quando o campo %s estiver ausente',
    async (campo) => {
      await consumer.onModuleInit();

      const dadosInvalidos = { ...dados };
      delete dadosInvalidos[campo as keyof typeof dadosInvalidos];

      const mensagem = criarMensagem({
        pattern: 'usuario-recuperar-senha',
        data: dadosInvalidos,
      });

      callbackMensagem?.(mensagem);

      expect(channel.nack).toHaveBeenCalledWith(mensagem, false, false);
      expect(enviarEmail.execute).not.toHaveBeenCalled();
    },
  );

  it('deve encaminhar para DLQ quando o use case lançar erro', async () => {
    enviarEmail.execute.mockRejectedValue(new Error('Falha no envio'));

    await consumer.onModuleInit();

    const mensagem = criarMensagem({
      pattern: 'usuario-recuperar-senha',
      data: dados,
    });

    callbackMensagem?.(mensagem);

    await vi.waitFor(() => {
      expect(enviarEmail.execute).toHaveBeenCalledOnce();
      expect(channel.nack).toHaveBeenCalledWith(mensagem, false, false);
    });

    expect(channel.ack).not.toHaveBeenCalled();
  });

  it('deve encaminhar para DLQ quando o erro do use case não for uma instância de Error', async () => {
    enviarEmail.execute.mockRejectedValue('Falha inesperada');

    await consumer.onModuleInit();

    const mensagem = criarMensagem({
      pattern: 'usuario-recuperar-senha',
      data: dados,
    });

    callbackMensagem?.(mensagem);

    await vi.waitFor(() => {
      expect(channel.nack).toHaveBeenCalledWith(mensagem, false, false);
    });

    expect(channel.ack).not.toHaveBeenCalled();
  });
});
