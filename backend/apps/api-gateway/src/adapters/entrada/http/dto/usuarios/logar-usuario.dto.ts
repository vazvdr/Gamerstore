import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LogarUsuarioDto {
  @ApiProperty({ example: 'joaozinho@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Senha123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  senha!: string;
}