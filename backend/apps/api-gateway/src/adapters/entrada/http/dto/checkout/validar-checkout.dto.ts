import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoFrete {
  PADRAO = 'PADRAO',
}

export class ItemCheckoutDto {
  @ApiProperty({ example: '123', description: 'ID do produto.' })
  @IsString()
  @IsNotEmpty()
  produtoId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantidade!: number;
}

export class FreteCheckoutDto {
  @ApiProperty({ enum: TipoFrete, example: TipoFrete.PADRAO })
  @IsEnum(TipoFrete)
  tipo!: TipoFrete;

  @ApiProperty({ example: '20000-000' })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/)
  cepDestino!: string;
}

export class ValidarCheckoutDto {
  @ApiProperty({ type: [ItemCheckoutDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemCheckoutDto)
  itens!: ItemCheckoutDto[];

  @ApiProperty({ type: FreteCheckoutDto })
  @ValidateNested()
  @Type(() => FreteCheckoutDto)
  frete!: FreteCheckoutDto;
}
