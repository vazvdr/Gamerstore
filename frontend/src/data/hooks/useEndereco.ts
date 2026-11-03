'use client';
import { useState, type FormEvent } from 'react';
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
  const [endereco, setEndereco] = useState<CadastrarEnderecoData>(enderecoInicial);
  const [enderecoEmEdicao, setEnderecoEmEdicao] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarEnderecos() {
    setLoading(true);
    setErro('');
    try {
      const dados = await enderecoService.listarEnderecos();
      setEnderecos(dados);
      return dados;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar os endereços.');
      return null;
    } finally {
      setLoading(false);
    }
  }
  async function salvarEndereco(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErro('');
    setSucesso('');
    try {
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
      if (enderecoEmEdicao) {
        await enderecoService.editarEndereco(enderecoEmEdicao, dados as EditarEnderecoData);
        setSucesso('Endereço atualizado com sucesso!');
      } else {
        await enderecoService.cadastrarEndereco(dados);
        setSucesso('Endereço cadastrado com sucesso!');
      }
      setEndereco(enderecoInicial);
      setEnderecoEmEdicao(null);
      const atualizados = await enderecoService.listarEnderecos();
      setEnderecos(atualizados);
      return true;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o endereço.');
      return false;
    } finally {
      setLoading(false);
    }
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
    setErro('');
    setSucesso('');
    try {
      await enderecoService.deletarEndereco({ id });
      setSucesso('Endereço excluído com sucesso!');
      if (enderecoEmEdicao === id) cancelarEdicaoEndereco();
      const atualizados = await enderecoService.listarEnderecos();
      setEnderecos(atualizados);
      return true;
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir o endereço.');
      return false;
    } finally {
      setLoading(false);
    }
  }
  function limparMensagens() {
    setErro('');
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
