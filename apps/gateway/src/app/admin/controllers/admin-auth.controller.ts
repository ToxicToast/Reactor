import {
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { parse } from 'cookie';
import type { CookieOptions, Request, Response } from 'express';
import { actorFromToken } from '../../auth/functions/index.js';
import { KeycloakTokenVerifier } from '../../auth/services/index.js';
import { GATEWAY_TOKENS } from '../../constants/index.js';
import {
  ADMIN_COOKIES,
  ADMIN_LOGIN_TTL_SECONDS,
  ADMIN_PATHS,
} from '../constants/index.js';
import {
  pkceChallenge,
  randomToken,
  safeReturnTo,
} from '../functions/index.js';
import type {
  AdminAuthConfig,
  AdminLoginState,
  AdminSession,
} from '../interfaces/index.js';
import { KeycloakOidcClient, SealedCookie } from '../services/index.js';

@ApiExcludeController()
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly cookies: SealedCookie,
    private readonly oidc: KeycloakOidcClient,
    private readonly verifier: KeycloakTokenVerifier,
    @Inject(GATEWAY_TOKENS.ADMIN_AUTH_CONFIG)
    private readonly config: AdminAuthConfig,
  ) {}

  @Get('login')
  async login(
    @Query('return_to') returnTo: unknown,
    @Res() response: Response,
  ): Promise<void> {
    const state = randomToken();
    const verifier = randomToken();
    const login: AdminLoginState = {
      state,
      verifier,
      return_to: safeReturnTo(returnTo),
    };

    response.cookie(
      ADMIN_COOKIES.LOGIN,
      await this.cookies.seal(login, ADMIN_LOGIN_TTL_SECONDS),
      this.cookieOptions(ADMIN_PATHS.AUTH, ADMIN_LOGIN_TTL_SECONDS),
    );
    response.redirect(
      this.oidc.authorizationUrl(state, pkceChallenge(verifier)),
    );
  }

  @Get('callback')
  async callback(
    @Query('code') code: unknown,
    @Query('state') state: unknown,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const login = await this.cookies.open<AdminLoginState>(
      parse(request.headers.cookie ?? '')[ADMIN_COOKIES.LOGIN],
    );
    response.clearCookie(ADMIN_COOKIES.LOGIN, { path: ADMIN_PATHS.AUTH });
    if (!login || typeof code !== 'string' || state !== login.state) {
      throw new UnauthorizedException('invalid or expired login');
    }

    const token = await this.oidc.exchangeCode(code, login.verifier);
    const actor = actorFromToken(
      await this.verifier.verify(token),
      this.verifier.config,
      request.ip ?? null,
    );
    if (!actor.id) {
      throw new UnauthorizedException('token has no subject');
    }

    const session: AdminSession = {
      sub: actor.id,
      permissions: actor.permissions,
    };
    response.cookie(
      ADMIN_COOKIES.SESSION,
      await this.cookies.seal(session, this.config.sessionTtlSeconds),
      this.cookieOptions(ADMIN_PATHS.ROOT, this.config.sessionTtlSeconds),
    );
    response.redirect(login.return_to);
  }

  @Get('logout')
  logout(@Res() response: Response): void {
    response.clearCookie(ADMIN_COOKIES.SESSION, { path: ADMIN_PATHS.ROOT });
    response.redirect(this.oidc.logoutUrl());
  }

  private cookieOptions(path: string, ttlSeconds: number): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.secureCookies,
      path,
      maxAge: ttlSeconds * 1000,
    };
  }
}
