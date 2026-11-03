import { api, authApi } from '@/data/api/api';
import { Endereco, CadastrarEnderecoData, EditarEnderecoData, DeletarEnderecoData } from '../types/endereco/endereco.types';

export const enderecoService = {
    async cadastrarEndereco(dados: CadastrarEnderecoData): Promise<Endereco> {
        const { data } = await api.post<Endereco>('/usuarios/enderecos', dados);
        return data;
    },
    async listarEnderecos(): Promise<Endereco[]> {
        const { data } = await api.get<Endereco[]>('/usuarios/enderecos');
        return data;
    },
    async editarEndereco(id: string, dados: EditarEnderecoData): Promise<Endereco> {
        const { data } = await api.patch<Endereco>(`/usuarios/enderecos/${encodeURIComponent(id)}`, dados);
        return data;
    },
    async deletarEndereco(dados: DeletarEnderecoData): Promise<{ message: string }> {
        const { data } = await api.delete<{ message: string }>('/usuarios/enderecos', { data: dados });
        return data;
    }
}