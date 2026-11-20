
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { UsuarioServiceController } from '../../../../adapters/entrada/http/usuario-service.controller';
import { UsuarioServiceService } from '../../../../adapters/entrada/http/usuario-service.service';

describe('UsuarioServiceController', () => {
  let controller: UsuarioServiceController;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    vi.clearAllMocks();

    service = {
      cadastrar: vi.fn().mockReturnValue({ id: 'usuario-1' }),
      login: vi.fn().mockReturnValue({ accessToken: 'access-token' }),
      refresh: vi.fn().mockReturnValue({ accessToken: 'novo-token' }),
      editar: vi.fn().mockReturnValue({ id: 'usuario-1' }),
      deletar: vi.fn().mockReturnValue({ sucesso: true }),
      recuperarSenha: vi.fn().mockReturnValue({ sucesso: true }),
      redefinirSenha: vi.fn().mockReturnValue({ sucesso: true }),
      cadastrarEndereco: vi.fn().mockReturnValue({ id: 'endereco-1' }),
      listarEnderecos: vi.fn().mockReturnValue([]),
      editarEndereco: vi.fn().mockReturnValue({ id: 'endereco-1' }),
      deletarEndereco: vi.fn().mockReturnValue({ sucesso: true }),
    };

    controller = new UsuarioServiceController(
      service as unknown as UsuarioServiceService,
    );
  });

  describe('cadastrar', () => {
    it('deve encaminhar os dados para o service', () => {
      const dto = { nome: 'Joazinho', email: 'joazinho@email.com' };

      expect(controller.cadastrar(dto as never)).toEqual({
        id: 'usuario-1',
      });

      expect(service.cadastrar).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('deve encaminhar os dados e o IP para o service', () => {
      const dto = { email: 'joazinho@email.com', senha: '123456' };

      expect(controller.login(dto as never, '127.0.0.1')).toEqual({
        accessToken: 'access-token',
      });

      expect(service.login).toHaveBeenCalledWith(dto, '127.0.0.1');
    });
  });

  describe('refresh', () => {
    it('deve encaminhar o refresh token para o service', () => {
      const dto = { refreshToken: 'refresh-token' };

      expect(controller.refresh(dto as never)).toEqual({
        accessToken: 'novo-token',
      });

      expect(service.refresh).toHaveBeenCalledWith(dto);
    });
  });

  describe('editar', () => {
    it('deve incluir o ID do usuário nos dados enviados ao service', () => {
      const dto = { nome: 'Joazinho atualizado' };

      expect(controller.editar(dto as never, 'usuario-1')).toEqual({
        id: 'usuario-1',
      });

      expect(service.editar).toHaveBeenCalledWith({
        ...dto,
        id: 'usuario-1',
      });
    });

    it('deve rejeitar a requisição quando o ID do usuário não for informado', () => {
      expect(() => controller.editar({} as never, '')).toThrow(
        new UnauthorizedException('Identidade do usuário não informada.'),
      );

      expect(service.editar).not.toHaveBeenCalled();
    });
  });

  describe('deletar', () => {
    it('deve incluir o ID do usuário nos dados enviados ao service', () => {
      const dto = { senha: '123456' };

      expect(controller.deletar(dto as never, 'usuario-1')).toEqual({
        sucesso: true,
      });

      expect(service.deletar).toHaveBeenCalledWith({
        ...dto,
        id: 'usuario-1',
      });
    });

    it('deve rejeitar a requisição quando o ID do usuário não for informado', () => {
      expect(() => controller.deletar({} as never, '')).toThrow(
        UnauthorizedException,
      );

      expect(service.deletar).not.toHaveBeenCalled();
    });
  });

  describe('recuperarSenha', () => {
    it('deve encaminhar os dados para o service', () => {
      const dto = { email: 'joazinho@email.com' };

      expect(controller.recuperarSenha(dto as never)).toEqual({
        sucesso: true,
      });

      expect(service.recuperarSenha).toHaveBeenCalledWith(dto);
    });
  });

  describe('redefinirSenha', () => {
    it('deve encaminhar os dados para o service', () => {
      const dto = {
        token: 'token-recuperacao',
        senha: 'nova-senha',
      };

      expect(controller.redefinirSenha(dto as never)).toEqual({
        sucesso: true,
      });

      expect(service.redefinirSenha).toHaveBeenCalledWith(dto);
    });
  });

  describe('cadastrarEndereco', () => {
    it('deve incluir o ID do usuário nos dados enviados ao service', () => {
      const dto = { rua: 'Rua das Flores', numero: '100' };

      expect(
        controller.cadastrarEndereco(dto as never, 'usuario-1'),
      ).toEqual({ id: 'endereco-1' });

      expect(service.cadastrarEndereco).toHaveBeenCalledWith({
        ...dto,
        user_id: 'usuario-1',
      });
    });

    it('deve rejeitar a requisição quando o ID do usuário não for informado', () => {
      expect(
        () => controller.cadastrarEndereco({} as never, ''),
      ).toThrow(UnauthorizedException);

      expect(service.cadastrarEndereco).not.toHaveBeenCalled();
    });
  });

  describe('listarEnderecos', () => {
    it('deve encaminhar o ID do usuário para o service', () => {
      expect(controller.listarEnderecos('usuario-1')).toEqual([]);

      expect(service.listarEnderecos).toHaveBeenCalledWith({
        user_id: 'usuario-1',
      });
    });

    it('deve rejeitar a requisição quando o ID do usuário não for informado', () => {
      expect(() => controller.listarEnderecos('')).toThrow(
        UnauthorizedException,
      );

      expect(service.listarEnderecos).not.toHaveBeenCalled();
    });
  });

  describe('editarEndereco', () => {
    it('deve incluir o ID do endereço e do usuário nos dados enviados ao service', () => {
      const dto = { rua: 'Rua das Palmeiras' };

      expect(
        controller.editarEndereco('endereco-1', dto as never, 'usuario-1'),
      ).toEqual({ id: 'endereco-1' });

      expect(service.editarEndereco).toHaveBeenCalledWith({
        ...dto,
        id: 'endereco-1',
        user_id: 'usuario-1',
      });
    });

    it('deve rejeitar a requisição quando o ID do usuário não for informado', () => {
      expect(
        () => controller.editarEndereco('endereco-1', {} as never, ''),
      ).toThrow(UnauthorizedException);

      expect(service.editarEndereco).not.toHaveBeenCalled();
    });
  });

  describe('deletarEndereco', () => {
    it('deve incluir o ID do usuário nos dados enviados ao service', () => {
      const dto = { id: 'endereco-1' };

      expect(
        controller.deletarEndereco(dto as never, 'usuario-1'),
      ).toEqual({ sucesso: true });

      expect(service.deletarEndereco).toHaveBeenCalledWith({
        ...dto,
        user_id: 'usuario-1',
      });
    });

    it('deve rejeitar a requisição quando o ID do usuário não for informado', () => {
      expect(
        () => controller.deletarEndereco({} as never, ''),
      ).toThrow(UnauthorizedException);

      expect(service.deletarEndereco).not.toHaveBeenCalled();
    });
  });
});
