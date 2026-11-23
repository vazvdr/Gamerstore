import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiGatewayController } from '../../../../adapters/entrada/http/api-gateway.controller';
import { ProdutosUseCase } from '../../../../usecases/produtos.usecase';
import { UsuariosUseCase } from '../../../../usecases/usuarios.usecase';
import { EnderecosUseCase } from '../../../../usecases/enderecos.usecase';
import { CarrinhoUseCase } from '../../../../usecases/carrinho.usecase';
import { FreteUseCase } from '../../../../usecases/frete.usecase';
import { CadastrarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/cadastrar-usuario.dto';
import { LogarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/logar-usuario.dto';
import { RefreshTokenDto } from '../../../../adapters/entrada/http/dto/usuarios/refresh-token.dto';
import { EditarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/editar-usuario.dto';
import { DeletarUsuarioDto } from '../../../../adapters/entrada/http/dto/usuarios/deletar-usuario.dto';
import { RecuperarSenhaDto } from '../../../../adapters/entrada/http/dto/usuarios/recuperar-senha.dto';
import { RedefinirSenhaDto } from '../../../../adapters/entrada/http/dto/usuarios/redefinir-senha.dto';
import { CadastrarEnderecoDto } from '../../../../adapters/entrada/http/dto/endereco/cadastrar-endereco.dto';
import { EditarEnderecoDto } from '../../../../adapters/entrada/http/dto/endereco/editar-endereco.dto';
import { DeletarEnderecoDto } from '../../../../adapters/entrada/http/dto/endereco/deletar-endereco.dto';
import { AdicionarProdutoDto } from '../../../../adapters/entrada/http/dto/carrinho/adicionar-produto.dto';
import { SincronizarCarrinhoDto } from '../../../../adapters/entrada/http/dto/carrinho/sincronizar-carrinho.dto';
import { CalcularFreteDto } from '../../../../adapters/entrada/http/dto/frete/calcular-frete.dto';

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController;
  let produtosUseCase: ProdutosUseCase;
  let usuariosUseCase: UsuariosUseCase;
  let enderecosUseCase: EnderecosUseCase;
  let carrinhoUseCase: CarrinhoUseCase;
  let freteUseCase: FreteUseCase;

  const userId = 'user-123';
  const request = {
    user: {
      sub: userId,
      email: 'joazinho@example.com',
    },
  };

  beforeEach(() => {
    produtosUseCase = {
      listarProdutos: vi.fn().mockResolvedValue([]),
      listarProdutosPorId: vi.fn().mockResolvedValue({ id: '1' }),
    } as unknown as ProdutosUseCase;

    usuariosUseCase = {
      cadastrarUsuario: vi.fn().mockResolvedValue({ id: userId }),
      loginUsuario: vi.fn().mockResolvedValue({ accessToken: 'token' }),
      refreshUsuario: vi.fn().mockResolvedValue({ accessToken: 'new-token' }),
      editarUsuario: vi.fn().mockResolvedValue({ sucesso: true }),
      deletarUsuario: vi.fn().mockResolvedValue({ sucesso: true }),
      recuperarSenha: vi.fn().mockResolvedValue({ sucesso: true }),
      redefinirSenha: vi.fn().mockResolvedValue({ sucesso: true }),
    } as unknown as UsuariosUseCase;

    enderecosUseCase = {
      cadastrarEndereco: vi.fn().mockResolvedValue({ id: 'endereco-1' }),
      listarEnderecos: vi.fn().mockResolvedValue([]),
      editarEndereco: vi.fn().mockResolvedValue({ sucesso: true }),
      deletarEndereco: vi.fn().mockResolvedValue({ sucesso: true }),
    } as unknown as EnderecosUseCase;

    carrinhoUseCase = {
      consultarCarrinho: vi.fn().mockResolvedValue({ itens: [] }),
      adicionarProdutoCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
      sincronizarCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
      aumentarQuantidadeProduto: vi.fn().mockResolvedValue({ sucesso: true }),
      diminuirQuantidadeProduto: vi.fn().mockResolvedValue({ sucesso: true }),
      excluirProdutoCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
      limparCarrinho: vi.fn().mockResolvedValue({ sucesso: true }),
    } as unknown as CarrinhoUseCase;

    freteUseCase = {
      calcularFrete: vi.fn().mockResolvedValue({
        cepDestino: '20000-000',
        estadoDestino: 'RJ',
        valorFrete: 15,
        moeda: 'BRL',
      }),
    } as unknown as FreteUseCase;

    controller = new ApiGatewayController(
      produtosUseCase,
      usuariosUseCase,
      enderecosUseCase,
      carrinhoUseCase,
      freteUseCase,
    );
  });

  describe('Produtos', () => {
    it('deve listar os produtos', async () => {
      await expect(controller.listarProdutos()).resolves.toEqual([]);

      expect(produtosUseCase.listarProdutos).toHaveBeenCalledOnce();
    });

    it('deve buscar um produto pelo ID', async () => {
      await expect(controller.listarPorId('produto-1')).resolves.toEqual({ id: '1' });

      expect(produtosUseCase.listarProdutosPorId).toHaveBeenCalledWith('produto-1');
    });
  });

  describe('Usuários', () => {
    it('deve cadastrar um usuário', async () => {
      const body = {} as CadastrarUsuarioDto;

      await controller.cadastrarUsuario(body);

      expect(usuariosUseCase.cadastrarUsuario).toHaveBeenCalledWith(body);
    });

    it('deve autenticar um usuário', async () => {
      const body = {} as LogarUsuarioDto;

      await controller.loginUsuario(body);

      expect(usuariosUseCase.loginUsuario).toHaveBeenCalledWith(body);
    });

    it('deve renovar a sessão do usuário', async () => {
      const body = {} as RefreshTokenDto;

      await controller.refreshUsuario(body);

      expect(usuariosUseCase.refreshUsuario).toHaveBeenCalledWith(body);
    });

    it('deve editar os dados do usuário autenticado', async () => {
      const body = {} as EditarUsuarioDto;

      await controller.editarUsuario(body, request);

      expect(usuariosUseCase.editarUsuario).toHaveBeenCalledWith(body, userId);
    });

    it('deve excluir a conta do usuário autenticado', async () => {
      const body = {} as DeletarUsuarioDto;

      await controller.deletarUsuario(body, request);

      expect(usuariosUseCase.deletarUsuario).toHaveBeenCalledWith(body, userId);
    });

    it('deve solicitar recuperação de senha', async () => {
      const body = { email: 'joazinho@example.com' } as RecuperarSenhaDto;

      await controller.recuperarSenha(body);

      expect(usuariosUseCase.recuperarSenha).toHaveBeenCalledWith(body);
    });

    it('deve redefinir a senha', async () => {
      const body = { token: 'recovery-token', senha: 'NovaSenha123!' } as RedefinirSenhaDto;

      await controller.redefinirSenha(body);

      expect(usuariosUseCase.redefinirSenha).toHaveBeenCalledWith(body);
    });
  });

  describe('Endereços', () => {
    it('deve cadastrar um endereço para o usuário autenticado', async () => {
      const body = {} as CadastrarEnderecoDto;

      await controller.cadastrarEndereco(body, request);

      expect(enderecosUseCase.cadastrarEndereco).toHaveBeenCalledWith(body, userId);
    });

    it('deve listar os endereços do usuário autenticado', async () => {
      await controller.listarEnderecos(request);

      expect(enderecosUseCase.listarEnderecos).toHaveBeenCalledWith(userId);
    });

    it('deve editar um endereço do usuário autenticado', async () => {
      const body = {} as EditarEnderecoDto;

      await controller.editarEndereco('endereco-1', body, request);

      expect(enderecosUseCase.editarEndereco).toHaveBeenCalledWith(
        'endereco-1',
        body,
        userId,
      );
    });

    it('deve excluir um endereço do usuário autenticado', async () => {
      const body = { id: 'endereco-1' } as DeletarEnderecoDto;

      await controller.deletarEndereco(body, request);

      expect(enderecosUseCase.deletarEndereco).toHaveBeenCalledWith(body, userId);
    });
  });

  describe('Carrinho', () => {
    it('deve consultar o carrinho do usuário autenticado', async () => {
      await controller.consultarCarrinho(request);

      expect(carrinhoUseCase.consultarCarrinho).toHaveBeenCalledWith(userId);
    });

    it('deve adicionar um produto ao carrinho', async () => {
      const body = {} as AdicionarProdutoDto;

      await controller.adicionarProdutoCarrinho(body, request);

      expect(carrinhoUseCase.adicionarProdutoCarrinho).toHaveBeenCalledWith(body, userId);
    });

    it('deve sincronizar o carrinho', async () => {
      const body = {} as SincronizarCarrinhoDto;

      await controller.sincronizarCarrinho(body, request);

      expect(carrinhoUseCase.sincronizarCarrinho).toHaveBeenCalledWith(body, userId);
    });

    it('deve aumentar a quantidade de um produto', async () => {
      await controller.aumentarQuantidadeProduto('produto-1', request);

      expect(carrinhoUseCase.aumentarQuantidadeProduto).toHaveBeenCalledWith(
        'produto-1',
        userId,
      );
    });

    it('deve diminuir a quantidade de um produto', async () => {
      await controller.diminuirQuantidadeProduto('produto-1', request);

      expect(carrinhoUseCase.diminuirQuantidadeProduto).toHaveBeenCalledWith(
        'produto-1',
        userId,
      );
    });

    it('deve excluir um produto do carrinho', async () => {
      await controller.excluirProdutoCarrinho('produto-1', request);

      expect(carrinhoUseCase.excluirProdutoCarrinho).toHaveBeenCalledWith(
        'produto-1',
        userId,
      );
    });

    it('deve limpar o carrinho', async () => {
      await controller.limparCarrinho(request);

      expect(carrinhoUseCase.limparCarrinho).toHaveBeenCalledWith(userId);
    });
  });

  describe('Fretes', () => {
    it('deve calcular o frete pelo CEP de destino', async () => {
      const body = { cepDestino: '20000-000' } as CalcularFreteDto;

      await expect(controller.calcularFrete(body)).resolves.toEqual({
        cepDestino: '20000-000',
        estadoDestino: 'RJ',
        valorFrete: 15,
        moeda: 'BRL',
      });

      expect(freteUseCase.calcularFrete).toHaveBeenCalledWith('20000-000');
    });

    it('deve propagar erros lançados pelo FreteUseCase', async () => {
      const error = new Error('Falha ao calcular frete');
      vi.mocked(freteUseCase.calcularFrete).mockRejectedValue(error);

      await expect(
        controller.calcularFrete({ cepDestino: '20000-000' } as CalcularFreteDto),
      ).rejects.toBe(error);
    });
  });

  it('deve retornar a resposta do UseCase', async () => {
    const response = { id: 'produto-1', nome: 'Notebook Gamer' };
    vi.mocked(produtosUseCase.listarProdutos).mockResolvedValue(response);

    await expect(controller.listarProdutos()).resolves.toEqual(response);
  });

  it('deve propagar erros lançados pelo UseCase', async () => {
    const error = new Error('Falha na operação');
    vi.mocked(produtosUseCase.listarProdutos).mockRejectedValue(error);

    await expect(controller.listarProdutos()).rejects.toBe(error);
  });
});
