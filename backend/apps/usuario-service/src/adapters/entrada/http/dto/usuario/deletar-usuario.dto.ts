import { IsString, MaxLength, MinLength } from 'class-validator';

export class DeletarUsuarioDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  senhaAtual!: string;
}

export type DeletarUsuarioInput = DeletarUsuarioDto & { id: string };
