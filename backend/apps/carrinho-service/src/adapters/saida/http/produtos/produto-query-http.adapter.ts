import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ProdutoParaCarrinho, ProdutoQueryPort } from '../../../../application/ports/saida/produto-query.ports';

@Injectable()
export class ProdutoQueryHttpAdapter implements ProdutoQueryPort {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}
  async buscarPorId(produtoId: string): Promise<ProdutoParaCarrinho> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ProdutoParaCarrinho>(
          `/produtos/${encodeURIComponent(produtoId)}`,
          {
            headers: {
              'x-internal-key': this.config.getOrThrow<string>(
                'security.internalApiKey',
              ),
            },
          },
        ),
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new HttpException(
          error.response?.data ?? 'Erro ao consultar produto.',
          error.response?.status ?? HttpStatus.BAD_GATEWAY,
        );
      }
      throw error;
    }
  }
}
