'use client';
import { useState, type FormEvent } from 'react';
import { normalizarErro, type ApiError } from '@/data/errors/api-error';
import { enderecoService } from '@/data/services/endereco.service';
import type {
  Endereco,
  CadastrarEnderecoData,
  EditarEnderecoData,
} from '@/data/types/endereco/endereco.types';

const enderecoInicial: CadastrarEnderecoData = {
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  complemento: '',
  principal: false,
};
export function useEndereco() {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [endereco, setEndereco] =
    useState<CadastrarEnderecoData>(enderecoInicial);
  const [enderecoEmEdicao, setEnderecoEmEdicao] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<ApiError | null>(null);
  const [sucesso, setSucesso] = useState('');
  async function carregarEnderecos() {
    setLoading(true);
    setErro(null);
    try {
      const dados = await enderecoService.listarEnderecos();
      setEnderecos(dados);
      return dados;
    } catch (error) {
      setErro(
        normalizarErro(error, 'Não foi possível carregar os endereços.'),
      );
      return null;
    } finally {
      setLoading(false);
    }
  }
  async function atualizarListagem(mensagemFallback: string) {
    try {
      const atualizados = await enderecoService.listarEnderecos();
      setEnderecos(atualizados);
    } catch (error) {
      setErro(normalizarErro(error, mensagemFallback));
    }
  }
  async function salvarEndereco(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErro(null);
    setSucesso('');
    const dados: CadastrarEnderecoData = {
      rua: endereco.rua.trim(),
      numero: endereco.numero.trim(),
      bairro: endereco.bairro.trim(),
      cidade: endereco.cidade.trim(),
      estado: endereco.estado.trim().toUpperCase(),
      cep: endereco.cep.trim(),
      complemento: endereco.complemento?.trim() || null,
      principal: endereco.principal,
    };
    try {
      if (enderecoEmEdicao) {
        await enderecoService.editarEndereco(
          enderecoEmEdicao,
          dados as EditarEnderecoData,
        );
        setSucesso('Endereço atualizado com sucesso!');
      } else {
        await enderecoService.cadastrarEndereco(dados);
        setSucesso('Endereço cadastrado com sucesso!');
      }

      setEndereco(enderecoInicial);
      setEnderecoEmEdicao(null);
    } catch (error) {
      setErro(normalizarErro(error, 'Não foi possível salvar o endereço.'));
      setLoading(false);
      return false;
    }

    await atualizarListagem(
      'Endereço salvo, mas não foi possível atualizar a listagem.',
    );

    setLoading(false);
    return true;
  }

  function selecionarEndereco(enderecoSelecionado: Endereco) {
    const {
      id,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      complemento,
      principal,
    } = enderecoSelecionado;
    setEndereco({
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      complemento: complemento ?? '',
      principal,
    });
    setEnderecoEmEdicao(id);
    limparMensagens();
  }
  function cancelarEdicaoEndereco() {
    setEndereco(enderecoInicial);
    setEnderecoEmEdicao(null);
    limparMensagens();
  }
  async function deletarEndereco(id: string) {
    setLoading(true);
    setErro(null);
    setSucesso('');
    try {
      await enderecoService.deletarEndereco({ id });
      setSucesso('Endereço excluído com sucesso!');
      if (enderecoEmEdicao === id) {
        cancelarEdicaoEndereco();
      }
    } catch (error) {
      setErro(normalizarErro(error, 'Não foi possível excluir o endereço.'));
      setLoading(false);
      return false;
    }
    await atualizarListagem(
      'Endereço excluído, mas não foi possível atualizar a listagem.',
    );
    setLoading(false);
    return true;
  }
  function limparMensagens() {
    setErro(null);
    setSucesso('');
  }

  return {
    enderecos,
    endereco,
    setEndereco,
    enderecoEmEdicao,
    loading,
    erro,
    sucesso,
    carregarEnderecos,
    salvarEndereco,
    selecionarEndereco,
    cancelarEdicaoEndereco,
    deletarEndereco,
    limparMensagens,
  };
}
