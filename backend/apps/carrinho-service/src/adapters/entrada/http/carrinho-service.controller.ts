
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CarrinhoService } from './carrinho-service.service';
import { AdicionarProdutoDto } from './dto/adicionar-produto.dto';
import { SincronizarCarrinhoDto } from './dto/sincronizar-carrinho.dto';
import { InternalApiGuard } from '../guards/internal-api.guards';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('carrinho')
@UseGuards(InternalApiGuard)
export class CarrinhoServiceController {
  constructor(
    private readonly carrinhoService: CarrinhoService,
  ) {}

  @Get()
  consultar(@Req() request: AuthenticatedRequest) {
    return this.carrinhoService.consultar(request.user.id);
  }
  @Post('itens')
  adicionar(
    @Req() request: AuthenticatedRequest,
    @Body() dto: AdicionarProdutoDto,
  ) {
    return this.carrinhoService.adicionar(
      request.user.id,
      dto.produtoId,
      dto.quantidade,
    );
  }
  @Post('sincronizar')
  sincronizar(
    @Req() request: AuthenticatedRequest,
    @Body() dto: SincronizarCarrinhoDto,
  ) {
    return this.carrinhoService.sincronizar(
      request.user.id,
      dto.itens,
    );
  }

  @Patch('itens/:produtoId/aumentar')
  aumentar(
    @Req() request: AuthenticatedRequest,
    @Param('produtoId') produtoId: string,
  ) {
    return this.carrinhoService.aumentar(
      request.user.id,
      produtoId,
    );
  }

  @Patch('itens/:produtoId/diminuir')
  diminuir(
    @Req() request: AuthenticatedRequest,
    @Param('produtoId') produtoId: string,
  ) {
    return this.carrinhoService.diminuir(
      request.user.id,
      produtoId,
    );
  }

  @Delete('itens/:produtoId')
  excluir(
    @Req() request: AuthenticatedRequest,
    @Param('produtoId') produtoId: string,
  ) {
    return this.carrinhoService.excluir(
      request.user.id,
      produtoId,
    );
  }

  @Delete()
  limpar(@Req() request: AuthenticatedRequest) {
    return this.carrinhoService.limpar(request.user.id);
  }
}
