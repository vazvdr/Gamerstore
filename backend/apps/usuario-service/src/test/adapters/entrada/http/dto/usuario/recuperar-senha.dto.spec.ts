
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { RecuperarSenhaDto } from '../../../../../../adapters/entrada/http/dto/usuario/recuperar-senha.dto';

describe('RecuperarSenhaDto', () => {
  it('deve aceitar e-mail válido', async () => {
    const dto = plainToInstance(RecuperarSenhaDto, {
      email: 'joazinho@email.com',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve converter e-mail para letras minúsculas', async () => {
    const dto = plainToInstance(RecuperarSenhaDto, {
      email: 'JOAZINHO@EMAIL.COM',
    });

    expect(dto.email).toBe('joazinho@email.com');
  });

  it('deve remover espaços do início e do fim do e-mail', async () => {
    const dto = plainToInstance(RecuperarSenhaDto, {
      email: '  joazinho@email.com  ',
    });

    expect(dto.email).toBe('joazinho@email.com');
  });

  it('deve remover espaços e converter e-mail para letras minúsculas', async () => {
    const dto = plainToInstance(RecuperarSenhaDto, {
      email: '  JOAZINHO@EMAIL.COM  ',
    });

    expect(dto.email).toBe('joazinho@email.com');
    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar e-mail inválido', async () => {
    const dto = plainToInstance(RecuperarSenhaDto, {
      email: 'email-invalido',
    });

    const erros = await validate(dto);

    expect(erros.some((e) => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar e-mail ausente', async () => {
    const dto = plainToInstance(RecuperarSenhaDto, {});

    expect((await validate(dto)).some((e) => e.property === 'email')).toBe(true);
  });

  it('deve preservar valores que não sejam strings durante a transformação', async () => {
    const dto = plainToInstance(RecuperarSenhaDto, {
      email: 123,
    });

    expect(dto.email).toBe(123);
    expect((await validate(dto)).some((e) => e.property === 'email')).toBe(true);
  });
});
