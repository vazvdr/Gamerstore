import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'seu-refresh-token' })
  @IsJWT()
  @IsNotEmpty()
  refreshToken!: string;
}