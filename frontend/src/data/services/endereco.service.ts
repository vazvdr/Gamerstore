import { api } from '@/data/api/api';
import type {
    Endereco, CadastrarEnderecoData, EditarEnderecoData, DeletarEnderecoData,
} from '../types/endereco/endereco.types';

let listagemEmAndamento: Promise<Endereco[]> | null = null;

export const enderecoService = {
    async cadastrarEndereco(dados: CadastrarEnderecoData): Promise<Endereco> {
        const { data } = await api.post<Endereco>(
            '/usuarios/enderecos',
            dados,
        );
        return data;
    },
    listarEnderecos(): Promise<Endereco[]> {
        if (!listagemEmAndamento) {
            listagemEmAndamento = api
                .get<Endereco[]>('/usuarios/enderecos')
                .then(({ data }) => data)
                .finally(() => {
                    listagemEmAndamento = null;
                });
        }
        return listagemEmAndamento;
    },
    async editarEndereco(
        id: string,
        dados: EditarEnderecoData,
    ): Promise<Endereco> {
        const { data } = await api.patch<Endereco>(
            `/usuarios/enderecos/${encodeURIComponent(id)}`,
            dados,
        );
        return data;
    },
    async deletarEndereco(
        dados: DeletarEnderecoData,
    ): Promise<{ message: string }> {
        const { data } = await api.delete<{ message: string }>(
            '/usuarios/enderecos',
            { data: dados },
        );
        return data;
    },
};
