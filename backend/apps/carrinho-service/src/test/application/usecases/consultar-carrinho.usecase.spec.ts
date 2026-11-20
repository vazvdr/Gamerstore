
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsultarCarrinhoUseCase } from '../../../application/usecases/carrinho/consultar-carrinho.usecase';
import type { CarrinhoRepositoryPort } from '../../../application/ports/saida/carrinho-repository.ports';
import type { Carrinho } from '../../../domain/entities/carrinho';

describe('ConsultarCarrinhoUseCase', () => {
    let useCase: ConsultarCarrinhoUseCase;
    let carrinhoRepository: CarrinhoRepositoryPort;

    beforeEach(() => {
        carrinhoRepository = {
            buscarPorUsuarioId: vi.fn(),
            salvar: vi.fn(),
        } as unknown as CarrinhoRepositoryPort;

        useCase = new ConsultarCarrinhoUseCase(carrinhoRepository);
    });

    it('deve retornar o carrinho encontrado no repositório', async () => {
        const carrinho: Carrinho = {
            usuarioId: 'usuario-1',
            itens: [
                {
                    produtoId: 'produto-1',
                    nome: 'Teclado Gamer',
                    marca: 'Logitech',
                    modelo: 'G Pro X',
                    preco: '250.00',
                    quantidade: 2,
                    imagemUrl: 'https://example.com/teclado.png',
                },
            ],
        };

        vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(carrinho);

        const resultado = await useCase.execute('usuario-1');

        expect(resultado).toBe(carrinho);
        expect(carrinhoRepository.buscarPorUsuarioId).toHaveBeenCalledOnce();
        expect(carrinhoRepository.buscarPorUsuarioId).toHaveBeenCalledWith('usuario-1');
    });

    it('deve retornar um carrinho vazio quando não encontrar um carrinho', async () => {
        vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(null as unknown as Carrinho);

        const resultado = await useCase.execute('usuario-2');

        expect(resultado).toEqual({
            usuarioId: 'usuario-2',
            itens: [],
        });
        expect(carrinhoRepository.buscarPorUsuarioId).toHaveBeenCalledWith('usuario-2');
    });

    it('deve retornar um carrinho vazio quando o repositório retornar undefined', async () => {
        vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockResolvedValue(undefined as unknown as Carrinho);

        const resultado = await useCase.execute('usuario-3');

        expect(resultado).toEqual({
            usuarioId: 'usuario-3',
            itens: [],
        });
    });

    it('deve propagar erros lançados pelo repositório', async () => {
        const erro = new Error('Falha ao consultar carrinho');

        vi.mocked(carrinhoRepository.buscarPorUsuarioId).mockRejectedValue(erro);

        await expect(useCase.execute('usuario-1')).rejects.toBe(erro);
    });
});
