
import { IsBoolean, IsOptional, IsString, MaxLength, Matches, MinLength } from 'class-validator';

export class EditarEnderecoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  bairro?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'Informe um CEP válido.' })
  cep?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  cidade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  complemento?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2}$/, { message: 'Informe uma UF válida.' })
  estado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  rua?: string;

  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}

export type EditarEnderecoInput = EditarEnderecoDto & { id: string; user_id: string };
