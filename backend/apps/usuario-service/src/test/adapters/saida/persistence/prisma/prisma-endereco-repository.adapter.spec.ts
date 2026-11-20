
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PrismaEnderecoRepositoryAdapter } from '../../../../../adapters/saida/persistence/prisma/prisma-endereco-repository.adapter';
import type { PrismaService } from '../../../../../adapters/saida/persistence/prisma/prisma.service';
import type { Endereco } from '../../../../../domain/entities/endereco';

describe('PrismaEnderecoRepositoryAdapter', () => {
  let adapter: PrismaEnderecoRepositoryAdapter;
  let prisma: PrismaService;

  let endereco: Endereco;

  let transaction: {
    endereco: {
      updateMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    endereco = {
      id: 'endereco-1',
      bairro: 'Centro',
      cep: '20000-000',
      cidade: 'Rio de Janeiro',
      complemento: null,
      estado: 'RJ',
      numero: '123',
      principal: true,
      rua: 'Rua das Flores',
      user_id: 'usuario-1',
    };

    transaction = {
      endereco: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue(endereco),
        findFirst: vi.fn().mockResolvedValue(endereco),
        update: vi.fn().mockResolvedValue(endereco),
      },
    };

    prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => unknown) =>
        callback(transaction),
      ),
      endereco: {
        findFirst: vi.fn().mockResolvedValue(endereco),
        findMany: vi.fn().mockResolvedValue([endereco]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;

    adapter = new PrismaEnderecoRepositoryAdapter(prisma);
  });

  describe('criar', () => {
    it('deve criar um endereço principal desmarcando os anteriores em uma transação', async () => {
      const dados = {
        bairro: 'Centro',
        cep: '20000-000',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        numero: '123',
        rua: 'Rua das Flores',
        user_id: 'usuario-1',
        principal: true,
      };

      const resultado = await adapter.criar(dados);

      expect(prisma.$transaction).toHaveBeenCalledOnce();
      expect(transaction.endereco.updateMany).toHaveBeenCalledWith({
        where: { user_id: dados.user_id, principal: true },
        data: { principal: false },
      });
      expect(transaction.endereco.create).toHaveBeenCalledWith({
        data: dados,
      });
      expect(resultado).toEqual(endereco);
    });

    it('deve criar um endereço sem desmarcar os anteriores quando não for principal', async () => {
      const dados = {
        bairro: 'Centro',
        cep: '20000-000',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        numero: '123',
        rua: 'Rua das Flores',
        user_id: 'usuario-1',
        principal: false,
      };

      const resultado = await adapter.criar(dados);

      expect(transaction.endereco.updateMany).not.toHaveBeenCalled();
      expect(transaction.endereco.create).toHaveBeenCalledWith({
        data: dados,
      });
      expect(resultado).toEqual(endereco);
    });

    it('deve propagar erros durante a criação', async () => {
      const erro = new Error('Erro ao criar endereço');
      transaction.endereco.create.mockRejectedValue(erro);

      await expect(
        adapter.criar({
          bairro: 'Centro',
          cep: '20000-000',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          numero: '123',
          rua: 'Rua das Flores',
          user_id: 'usuario-1',
        }),
      ).rejects.toThrow(erro);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar um endereço pelo ID e usuário', async () => {
      const resultado = await adapter.buscarPorId('endereco-1', 'usuario-1');

      expect(prisma.endereco.findFirst).toHaveBeenCalledWith({
        where: { id: 'endereco-1', user_id: 'usuario-1' },
      });
      expect(resultado).toEqual(endereco);
    });

    it('deve retornar null quando o endereço não for encontrado', async () => {
      vi.mocked(prisma.endereco.findFirst).mockResolvedValue(null);

      const resultado = await adapter.buscarPorId('inexistente', 'usuario-1');

      expect(resultado).toBeNull();
    });

    it('deve propagar erros durante a busca', async () => {
      const erro = new Error('Erro ao buscar endereço');
      vi.mocked(prisma.endereco.findFirst).mockRejectedValue(erro);

      await expect(
        adapter.buscarPorId('endereco-1', 'usuario-1'),
      ).rejects.toThrow(erro);
    });
  });

  describe('listarPorUsuario', () => {
    it('deve listar os endereços do usuário ordenando os principais primeiro e depois pela rua', async () => {
      const resultado = await adapter.listarPorUsuario('usuario-1');

      expect(prisma.endereco.findMany).toHaveBeenCalledWith({
        where: { user_id: 'usuario-1' },
        orderBy: [{ principal: 'desc' }, { rua: 'asc' }],
      });
      expect(resultado).toEqual([endereco]);
    });

    it('deve retornar uma lista vazia quando o usuário não possuir endereços', async () => {
      vi.mocked(prisma.endereco.findMany).mockResolvedValue([]);

      const resultado = await adapter.listarPorUsuario('usuario-1');

      expect(resultado).toEqual([]);
    });

    it('deve propagar erros durante a listagem', async () => {
      const erro = new Error('Erro ao listar endereços');
      vi.mocked(prisma.endereco.findMany).mockRejectedValue(erro);

      await expect(
        adapter.listarPorUsuario('usuario-1'),
      ).rejects.toThrow(erro);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um endereço usando o ID e o usuário', async () => {
      const dados = {
        rua: 'Avenida Brasil',
        numero: '456',
      };

      const resultado = await adapter.atualizar(
        'endereco-1',
        'usuario-1',
        dados,
      );

      expect(prisma.endereco.updateMany).toHaveBeenCalledWith({
        where: { id: 'endereco-1', user_id: 'usuario-1' },
        data: dados,
      });
      expect(resultado).toEqual({ count: 1 });
    });

    it('deve retornar count zero quando nenhum endereço for atualizado', async () => {
      vi.mocked(prisma.endereco.updateMany).mockResolvedValue({ count: 0 });

      const resultado = await adapter.atualizar(
        'inexistente',
        'usuario-1',
        { rua: 'Avenida Brasil' },
      );

      expect(resultado).toEqual({ count: 0 });
    });

    it('deve propagar erros durante a atualização', async () => {
      const erro = new Error('Erro ao atualizar endereço');
      vi.mocked(prisma.endereco.updateMany).mockRejectedValue(erro);

      await expect(
        adapter.atualizar('endereco-1', 'usuario-1', {
          rua: 'Avenida Brasil',
        }),
      ).rejects.toThrow(erro);
    });
  });

  describe('definirPrincipal', () => {
    it('deve desmarcar os endereços anteriores e definir o novo principal', async () => {
      const resultado = await adapter.definirPrincipal(
        'endereco-1',
        'usuario-1',
      );

      expect(prisma.$transaction).toHaveBeenCalledOnce();
      expect(transaction.endereco.findFirst).toHaveBeenCalledWith({
        where: { id: 'endereco-1', user_id: 'usuario-1' },
      });
      expect(transaction.endereco.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'usuario-1', principal: true },
        data: { principal: false },
      });
      expect(transaction.endereco.update).toHaveBeenCalledWith({
        where: { id: 'endereco-1' },
        data: { principal: true },
      });
      expect(resultado).toEqual(endereco);
    });

    it('deve lançar NotFoundException quando o endereço não existir', async () => {
      transaction.endereco.findFirst.mockResolvedValue(null);

      await expect(
        adapter.definirPrincipal('inexistente', 'usuario-1'),
      ).rejects.toThrow(NotFoundException);

      expect(transaction.endereco.updateMany).not.toHaveBeenCalled();
      expect(transaction.endereco.update).not.toHaveBeenCalled();
    });

    it('deve propagar erros durante a definição do endereço principal', async () => {
      const erro = new Error('Erro ao definir endereço principal');
      transaction.endereco.update.mockRejectedValue(erro);

      await expect(
        adapter.definirPrincipal('endereco-1', 'usuario-1'),
      ).rejects.toThrow(erro);
    });
  });

  describe('deletar', () => {
    it('deve excluir um endereço pelo ID e usuário', async () => {
      const resultado = await adapter.deletar('endereco-1', 'usuario-1');

      expect(prisma.endereco.deleteMany).toHaveBeenCalledWith({
        where: { id: 'endereco-1', user_id: 'usuario-1' },
      });
      expect(resultado).toEqual({ count: 1 });
    });

    it('deve retornar count zero quando nenhum endereço for excluído', async () => {
      vi.mocked(prisma.endereco.deleteMany).mockResolvedValue({ count: 0 });

      const resultado = await adapter.deletar('inexistente', 'usuario-1');

      expect(resultado).toEqual({ count: 0 });
    });

    it('deve propagar erros durante a exclusão', async () => {
      const erro = new Error('Erro ao excluir endereço');
      vi.mocked(prisma.endereco.deleteMany).mockRejectedValue(erro);

      await expect(
        adapter.deletar('endereco-1', 'usuario-1'),
      ).rejects.toThrow(erro);
    });
  });
});
