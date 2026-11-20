
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQNotificacaoRecuperacaoSenhaAdapter } from '../../../../../adapters/saida/messaging/rabbitmq/rabbitmq-notificacao-recuperacao-senha.adapter';

describe('RabbitMQNotificacaoRecuperacaoSenhaAdapter', () => {
  let adapter: RabbitMQNotificacaoRecuperacaoSenhaAdapter;
  let rabbitmq: { emit: ReturnType<typeof vi.fn> };

  const dados = {
    usuarioId: 'usuario-123',
    nome: 'Joazinho',
    email: 'joazinho@example.com',
    link: 'https://gamerstore.com/redefinir-senha/token-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    rabbitmq = {
      emit: vi.fn().mockReturnValue(of(undefined)),
    };

    adapter = new RabbitMQNotificacaoRecuperacaoSenhaAdapter(
      rabbitmq as unknown as ClientProxy,
    );
  });

  describe('enviar', () => {
    it('deve publicar o evento de recuperação de senha com os dados do usuário', async () => {
      await adapter.enviar(dados);

      expect(rabbitmq.emit).toHaveBeenCalledOnce();
      expect(rabbitmq.emit).toHaveBeenCalledWith(
        'usuario-recuperar-senha',
        dados,
      );
    });

    it('deve resolver quando a publicação do evento for concluída', async () => {
      rabbitmq.emit.mockReturnValue(of(undefined));

      await expect(adapter.enviar(dados)).resolves.toBeUndefined();
    });

    it('deve propagar erros ocorridos durante a publicação do evento', async () => {
      const erro = new Error('Erro ao publicar mensagem');

      rabbitmq.emit.mockReturnValue(
        throwError(() => erro),
      );

      await expect(adapter.enviar(dados)).rejects.toThrow(erro);
    });
  });
});
