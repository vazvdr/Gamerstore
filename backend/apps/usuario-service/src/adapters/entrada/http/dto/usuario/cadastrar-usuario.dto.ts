
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CadastrarUsuarioDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  senha!: string;
}
