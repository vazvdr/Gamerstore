import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CalcularFreteDto {
  @ApiProperty({ example: '23087-420', description: 'CEP de destino. Aceita os formatos 23087420 ou 23087-420.' })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'O CEP deve conter 8 dígitos, com ou sem hífen.' })
  cepDestino!: string;
}
