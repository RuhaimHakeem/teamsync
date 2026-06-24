import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsJWT, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'Refresh token for mobile clients. Web clients usually send this via HttpOnly cookie.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsJWT()
  refreshToken?: string;

  @ApiPropertyOptional({ example: false, description: 'Mobile clients set this to true so JWTs are returned in the response body.' })
  @IsOptional()
  @IsBoolean()
  returnTokens?: boolean;
}
