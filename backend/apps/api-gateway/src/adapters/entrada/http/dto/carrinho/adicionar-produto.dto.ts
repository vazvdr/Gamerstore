import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AdicionarProdutoDto {
  @ApiProperty({ example: '1', description: 'ID do produto.' })
  @IsString()
  @IsNotEmpty()
  produtoId!: string;

  @ApiProperty({ example: 2, minimum: 1, description: 'Quantidade de unidades.' })
  @IsInt()
  @Min(1)
  quantidade!: number;
}