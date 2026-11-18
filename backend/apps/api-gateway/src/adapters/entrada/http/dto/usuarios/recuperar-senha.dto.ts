import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class RecuperarSenhaDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;
}