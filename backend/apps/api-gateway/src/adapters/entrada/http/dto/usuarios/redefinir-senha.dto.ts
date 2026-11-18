import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @ApiProperty({ example: 'a'.repeat(64), description: 'Token hexadecimal de recuperação de senha.' })
  @IsString({ message: 'Token inválido.' })
  @Matches(/^[a-f0-9]{64}$/i, { message: 'Token de recuperação inválido.' })
  token!: string;

  @ApiProperty({ example: 'NovaSenha@123', minLength: 8 })
  @IsString({ message: 'Informe uma senha válida.' })
  @MinLength(8, { message: 'A senha deve possuir pelo menos 8 caracteres.' })
  senha!: string;
}