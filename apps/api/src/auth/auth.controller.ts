import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './auth-cookie.constants';
import { readCookieFromRequest } from './cookie.utils';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthUser } from './types/auth-user';

@Controller('auth')
export class AuthController {
  private readonly accessCookieMaxAgeMs: number;
  private readonly refreshCookieMaxAgeMs: number;
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.accessCookieMaxAgeMs =
      Number(configService.get('JWT_ACCESS_EXPIRES_IN_SECONDS') ?? 900) * 1000;
    this.refreshCookieMaxAgeMs =
      Number(configService.get('JWT_REFRESH_EXPIRES_IN_SECONDS') ?? 604800) * 1000;
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const auth = await this.authService.register(dto);
    this.setAuthCookies(response, auth.accessToken, auth.refreshToken, auth.rememberMe);
    return { user: auth.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const auth = await this.authService.login(dto);
    this.setAuthCookies(response, auth.accessToken, auth.refreshToken, auth.rememberMe);
    return { user: auth.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = dto?.refreshToken ?? readCookieFromRequest(request, REFRESH_TOKEN_COOKIE);
    const auth = await this.authService.refresh(refreshToken);
    this.setAuthCookies(response, auth.accessToken, auth.refreshToken, auth.rememberMe);
    return { user: auth.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, this.baseCookieOptions());
    response.clearCookie(REFRESH_TOKEN_COOKIE, this.baseCookieOptions());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.findCurrentUser(user.id);
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean,
  ) {
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.baseCookieOptions(),
      maxAge: this.accessCookieMaxAgeMs,
    });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.baseCookieOptions(),
      ...(rememberMe ? { maxAge: this.refreshCookieMaxAgeMs } : {}),
    });
  }

  private baseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'none' : 'lax',
      path: '/',
    };
  }
}
