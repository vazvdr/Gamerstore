import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CadastrarEnderecoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  bairro!: string;

  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'Informe um CEP válido.' })
  cep!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  cidade!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  complemento?: string;

  @IsString()
  @Matches(/^[A-Za-z]{2}$/, { message: 'Informe uma UF válida.' })
  estado!: string;

  @IsString()
  @MaxLength(20)
  numero!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  rua!: string;

  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}

export type CadastrarEnderecoInput = CadastrarEnderecoDto & { user_id: string };
