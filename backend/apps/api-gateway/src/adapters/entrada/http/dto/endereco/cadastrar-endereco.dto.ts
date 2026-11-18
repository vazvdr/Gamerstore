import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CadastrarEnderecoDto {
  @ApiProperty({ example: 'Centro', minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  bairro!: string;

  @ApiProperty({ example: '20000-000' })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'Informe um CEP válido.' })
  cep!: string;

  @ApiProperty({ example: 'Rio de Janeiro', minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  cidade!: string;

  @ApiPropertyOptional({ example: 'Apartamento 101', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  complemento?: string;

  @ApiProperty({ example: 'RJ', pattern: '^[A-Za-z]{2}$' })
  @IsString()
  @Matches(/^[A-Za-z]{2}$/, { message: 'Informe uma UF válida.' })
  estado!: string;

  @ApiProperty({ example: '123', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  numero!: string;

  @ApiProperty({ example: 'Rua das Flores', minLength: 2, maxLength: 255 })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  rua!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}