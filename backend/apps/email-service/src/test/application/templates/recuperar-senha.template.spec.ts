
import { describe, expect, it } from 'vitest';
import { recuperarSenhaTemplate } from '../../../application/templates/recuperar-senha.template';

describe('recuperarSenhaTemplate', () => {
  it('deve gerar o HTML com o nome e o link informados', () => {
    const html = recuperarSenhaTemplate({
      nome: 'Joazinho',
      link: 'https://gamerstore.com/redefinir-senha?token=abc123',
    });

    expect(html).toContain('Olá, <strong style="color:#FFFFFF;">Joazinho</strong>!');
    expect(html).toContain('href="https://gamerstore.com/redefinir-senha?token=abc123"');
    expect(html).toContain('REDEFINIR MINHA SENHA');
    expect(html).toContain('Recuperação de senha | GamerStore');
  });

  it('deve escapar todos os caracteres especiais do nome', () => {
    const html = recuperarSenhaTemplate({
      nome: `João & <Joazinho> "Junior" 'Silva'`,
      link: 'https://gamerstore.com/redefinir-senha',
    });

    expect(html).toContain(
      'João &amp; &lt;Joazinho&gt; &quot;Junior&quot; &#39;Silva&#39;',
    );

    expect(html).not.toContain('<Joazinho>');
  });

  it('deve escapar os caracteres especiais do link', () => {
    const html = recuperarSenhaTemplate({
      nome: 'Joazinho',
      link: 'https://gamerstore.com/redefinir?token=abc&redirect="home"',
    });

    expect(html).toContain(
      'href="https://gamerstore.com/redefinir?token=abc&amp;redirect=&quot;home&quot;"',
    );
  });

  it('deve preservar o conteúdo HTML e as informações de segurança do template', () => {
    const html = recuperarSenhaTemplate({
      nome: 'Joazinho',
      link: 'https://gamerstore.com/redefinir',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain('Sua senha permanecerá inalterada.');
    expect(html).toContain('este link terá validade limitada');
    expect(html).toContain('poderá ser utilizado uma única vez.');
  });
});
