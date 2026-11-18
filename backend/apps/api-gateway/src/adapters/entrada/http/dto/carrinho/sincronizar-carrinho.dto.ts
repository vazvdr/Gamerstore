import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';

export class ItemSincronizacaoDto {
  @ApiProperty({ example: '1', description: 'ID do produto.' })
  @IsString()
  @IsNotEmpty()
  produtoId!: string;

  @ApiProperty({ example: 2, minimum: 1, description: 'Quantidade de unidades.' })
  @IsInt()
  @Min(1)
  quantidade!: number;
}

export class SincronizarCarrinhoDto {
  @ApiProperty({ type: () => [ItemSincronizacaoDto], description: 'Itens que serão sincronizados no carrinho.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSincronizacaoDto)
  itens!: ItemSincronizacaoDto[];
}