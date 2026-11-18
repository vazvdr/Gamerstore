import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, Matches, MinLength } from 'class-validator';

export class EditarEnderecoDto {
  @ApiPropertyOptional({ example: 'Centro', minLength: 2, maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  bairro?: string;

  @ApiPropertyOptional({ example: '20000-000' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'Informe um CEP válido.' })
  cep?: string;

  @ApiPropertyOptional({ example: 'Rio de Janeiro', minLength: 2, maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  cidade?: string;

  @ApiPropertyOptional({ example: 'Apartamento 101', maxLength: 150, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  complemento?: string | null;

  @ApiPropertyOptional({ example: 'RJ', pattern: '^[A-Za-z]{2}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2}$/, { message: 'Informe uma UF válida.' })
  estado?: string;

  @ApiPropertyOptional({ example: '123', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores', minLength: 2, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  rua?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}