import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AdicionarProdutoDto {
  @IsString()
  @IsNotEmpty()
  produtoId: string;
  @IsInt()
  @Min(1)
  quantidade: number;
}
