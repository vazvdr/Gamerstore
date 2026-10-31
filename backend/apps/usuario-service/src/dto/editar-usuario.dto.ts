import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class EditarUsuarioDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  senhaAtual!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  novaSenha?: string;
}

export type EditarUsuarioInput = EditarUsuarioDto & { id: string };