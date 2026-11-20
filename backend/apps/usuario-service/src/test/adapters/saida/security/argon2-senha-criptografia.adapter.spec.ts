
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as argon2 from 'argon2';
import { Argon2SenhaCriptografiaAdapter } from '../../../../adapters/saida/security/argon2-senha-criptografia.adapter';

vi.mock('argon2', () => ({
  argon2id: 2,
  hash: vi.fn(),
  verify: vi.fn(),
}));

describe('Argon2SenhaCriptografiaAdapter', () => {
  let adapter: Argon2SenhaCriptografiaAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new Argon2SenhaCriptografiaAdapter();
  });

  describe('hashSenha', () => {
    it('deve gerar o hash da senha utilizando Argon2id', async () => {
      const senha = 'Senha@123';
      const hash = 'hash-gerado';

      vi.mocked(argon2.hash).mockResolvedValue(hash);

      const resultado = await adapter.hashSenha(senha);

      expect(resultado).toBe(hash);
      expect(argon2.hash).toHaveBeenCalledOnce();
      expect(argon2.hash).toHaveBeenCalledWith(senha, {
        type: argon2.argon2id,
      });
    });

    it('deve propagar erros ocorridos durante a geração do hash', async () => {
      const erro = new Error('Erro ao gerar hash');

      vi.mocked(argon2.hash).mockRejectedValue(erro);

      await expect(adapter.hashSenha('Senha@123')).rejects.toThrow(erro);
    });
  });

  describe('verificarSenha', () => {
    it('deve retornar true quando a senha corresponder ao hash', async () => {
      const hash = 'hash-valido';
      const senha = 'Senha@123';

      vi.mocked(argon2.verify).mockResolvedValue(true);

      const resultado = await adapter.verificarSenha(hash, senha);

      expect(resultado).toBe(true);
      expect(argon2.verify).toHaveBeenCalledOnce();
      expect(argon2.verify).toHaveBeenCalledWith(hash, senha);
    });

    it('deve retornar false quando a senha não corresponder ao hash', async () => {
      const hash = 'hash-valido';
      const senha = 'SenhaIncorreta';

      vi.mocked(argon2.verify).mockResolvedValue(false);

      const resultado = await adapter.verificarSenha(hash, senha);

      expect(resultado).toBe(false);
      expect(argon2.verify).toHaveBeenCalledWith(hash, senha);
    });

    it('deve retornar false quando ocorrer um erro ao verificar o hash', async () => {
      vi.mocked(argon2.verify).mockRejectedValue(
        new Error('Hash inválido'),
      );

      const resultado = await adapter.verificarSenha(
        'hash-invalido',
        'Senha@123',
      );

      expect(resultado).toBe(false);
    });
  });
});
