import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CalcularFreteDto {
  @ApiProperty({
    example: '20000-000',
    description: 'CEP de destino. Aceita os formatos 2000000 ou 20000-000.',
  })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'O CEP deve conter 8 dígitos, com ou sem hífen.',
  })
  cepDestino!: string;
}
