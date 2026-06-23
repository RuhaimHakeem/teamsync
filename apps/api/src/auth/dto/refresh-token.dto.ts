import { IsBoolean, IsJWT, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @IsOptional()
  @IsJWT()
  refreshToken?: string;

  @IsOptional()
  @IsBoolean()
  returnTokens?: boolean;
}
