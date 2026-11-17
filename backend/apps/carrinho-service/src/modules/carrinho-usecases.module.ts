import { Module } from '@nestjs/common';
import { AdicionarProdutoUseCase } from '../application/usecases/carrinho/adicionar-produto.usecase';
import { AumentarQuantidadeProdutoUseCase } from '../application/usecases/carrinho/aumentar-quantidade-produto.usecase';
import { ConsultarCarrinhoUseCase } from '../application/usecases/carrinho/consultar-carrinho.usecase';
import { DiminuirQuantidadeProdutoUseCase } from '../application/usecases/carrinho/diminuir-quantidade-produto.usecase';
import { ExcluirProdutoUseCase } from '../application/usecases/carrinho/excluir-produto.usecase';
import { LimparCarrinhoUseCase } from '../application/usecases/carrinho/limpar-carrinho.usecase';
import { SincronizarCarrinhoUseCase } from '../application/usecases/carrinho/sincronizar-carrinho.usecase';
import { CarrinhoAdaptersModule } from './carrinho-adapters.module';

@Module({
  imports: [CarrinhoAdaptersModule],
  providers: [
    SincronizarCarrinhoUseCase,
    AdicionarProdutoUseCase,
    AumentarQuantidadeProdutoUseCase,
    ConsultarCarrinhoUseCase,
    DiminuirQuantidadeProdutoUseCase,
    ExcluirProdutoUseCase,
    LimparCarrinhoUseCase,
  ],
  exports: [
    SincronizarCarrinhoUseCase,
    AdicionarProdutoUseCase,
    AumentarQuantidadeProdutoUseCase,
    ConsultarCarrinhoUseCase,
    DiminuirQuantidadeProdutoUseCase,
    ExcluirProdutoUseCase,
    LimparCarrinhoUseCase,
  ],
})
export class CarrinhoUseCasesModule {}
