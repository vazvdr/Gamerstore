import { IsUUID } from 'class-validator';

export class DeletarEnderecoDto {
  @IsUUID()
  id!: string;
}
export type DeletarEnderecoInput = DeletarEnderecoDto & { user_id: string };
