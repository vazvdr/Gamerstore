
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnviarEmailRecuperacaoSenhaUseCase } from '../../../application/usecases/enviar-email-recuperacao-senha.usecase';
import type { EmailSenderPort } from '../../../application/ports/saida/email-sender.port';
import { recuperarSenhaTemplate } from '../../../application/templates/recuperar-senha.template';

describe('EnviarEmailRecuperacaoSenhaUseCase', () => {
  let useCase: EnviarEmailRecuperacaoSenhaUseCase;
  let emailSender: EmailSenderPort;

  const dados = {
    nome: 'Joazinho',
    email: 'joazinho@example.com',
    link: 'https://gamerstore.com/redefinir-senha/token',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    emailSender = {
      enviarEmail: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new EnviarEmailRecuperacaoSenhaUseCase(emailSender);
  });

  it('deve enviar o e-mail com os dados corretos', async () => {
    await useCase.execute(dados);

    expect(emailSender.enviarEmail).toHaveBeenCalledWith({
      to: [{ name: dados.nome, email: dados.email }],
      subject: 'Recuperação de senha | GamerStore',
      htmlContent: recuperarSenhaTemplate({
        nome: dados.nome,
        link: dados.link,
      }),
    });
  });

  it('deve aguardar a conclusão do envio do e-mail', async () => {
    let concluirEnvio!: () => void;

    vi.mocked(emailSender.enviarEmail).mockReturnValue(
      new Promise<string | undefined>((resolve) => {
        concluirEnvio = () => resolve('email-enviado');
      }),
    );

    let execucaoConcluida = false;

    const execucao = useCase.execute(dados).then(() => {
      execucaoConcluida = true;
    });

    await Promise.resolve();

    expect(execucaoConcluida).toBe(false);

    concluirEnvio();
    await execucao;

    expect(execucaoConcluida).toBe(true);
  });

  it('deve propagar o erro quando o envio do e-mail falhar', async () => {
    const erro = new Error('Falha ao enviar e-mail');

    vi.mocked(emailSender.enviarEmail).mockRejectedValue(erro);

    await expect(useCase.execute(dados)).rejects.toThrow(erro);
  });
});
