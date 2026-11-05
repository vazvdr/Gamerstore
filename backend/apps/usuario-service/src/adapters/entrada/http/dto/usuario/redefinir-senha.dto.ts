import { IsString, Matches, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString({ message: 'Token inválido.' })
  @Matches(/^[a-f0-9]{64}$/i, { message: 'Token de recuperação inválido.' })
  token: string;

  @IsString({ message: 'Informe uma senha válida.' })
  @MinLength(8, { message: 'A senha deve possuir pelo menos 8 caracteres.' })
  senha: string;
}
