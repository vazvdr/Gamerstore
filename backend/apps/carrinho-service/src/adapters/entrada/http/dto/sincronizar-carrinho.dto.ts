import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemSincronizacaoDto {
  @IsString()
  @IsNotEmpty()
  produtoId: string;

  @IsInt()
  @Min(1)
  quantidade: number;
}

export class SincronizarCarrinhoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemSincronizacaoDto)
  itens: ItemSincronizacaoDto[];
}
