import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { InternalApiGuard } from '../../guards/internal-api-guard';
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CalcularFreteUseCase } from '../../../../application/usecases/calcular-frete.usecase';
import { CalcularFreteDto } from '../dto/calcular-frete.dto';

@ApiTags('Fretes')
@Controller('fretes')
@UseGuards(InternalApiGuard)
export class FreteController {
  constructor(private readonly calcularFreteUseCase: CalcularFreteUseCase) { }

  @Post('calcular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calcular frete por CEP de destino' })
  @ApiResponse({ status: 200, description: 'Valor do frete calculado.' })
  @ApiBadRequestResponse({ description: 'CEP inválido ou não reconhecido.' })
  calcular(@Body() dados: CalcularFreteDto) {
    return this.calcularFreteUseCase.executar(dados.cepDestino);
  }
}
