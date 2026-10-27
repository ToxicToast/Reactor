import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ActorContext } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import { parse } from 'cookie';
import type { CookieOptions, Request, Response } from 'express';
import { firstValueFrom, type Observable } from 'rxjs';
import { ADMIN_COOKIES, ADMIN_PATHS } from '../../admin/constants/index.js';
import { adminActor, randomToken } from '../../admin/functions/index.js';
import type {
  AdminAuthConfig,
  AdminSession,
} from '../../admin/interfaces/index.js';
import { SealedCookie } from '../../admin/services/index.js';
import { GATEWAY_TOKENS } from '../../constants/index.js';
import {
  TWITCH_COOKIES,
  TWITCH_STATE_TTL_SECONDS,
} from '../constants/index.js';
import type {
  TwitchAdminConfig,
  TwitchConnectState,
} from '../interfaces/index.js';
import { TwitchGateway } from '../twitch.gateway.js';

@ApiExcludeController()
@Controller('admin/twitch')
export class TwitchConnectController {
  constructor(
    private readonly cookies: SealedCookie,
    private readonly twitch: TwitchGateway,
    private readonly actors: ActorContext,
    @Inject(GATEWAY_TOKENS.TWITCH_ADMIN_CONFIG)
    private readonly config: TwitchAdminConfig,
    @Inject(GATEWAY_TOKENS.ADMIN_AUTH_CONFIG)
    private readonly adminConfig: AdminAuthConfig,
  ) {}

  @Get('connect')
  async connect(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const session = await this.session(request);
    if (!session) {
      const returnTo = encodeURIComponent(ADMIN_PATHS.TWITCH_CONNECT);
      response.redirect(`${ADMIN_PATHS.LOGIN}?return_to=${returnTo}`);
      return;
    }

    const state = randomToken();
    const { url } = await this.asAdmin(session, request, () => {
      return this.twitch.startAuthorization({
        state,
        redirect_uri: this.config.redirectUri,
      });
    });

    const connect: TwitchConnectState = { state };
    response.cookie(
      TWITCH_COOKIES.STATE,
      await this.cookies.seal(connect, TWITCH_STATE_TTL_SECONDS),
      this.cookieOptions(),
    );
    response.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: unknown,
    @Query('state') state: unknown,
    @Query('error_description') errorDescription: unknown,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const cookies = parse(request.headers.cookie ?? '');
    const connect = await this.cookies.open<TwitchConnectState>(
      cookies[TWITCH_COOKIES.STATE],
    );
    response.clearCookie(TWITCH_COOKIES.STATE, { path: ADMIN_PATHS.TWITCH });
    if (!connect || state !== connect.state) {
      throw new UnauthorizedException('invalid or expired twitch login');
    }
    if (typeof code !== 'string') {
      throw new BadRequestException(
        typeof errorDescription === 'string'
          ? errorDescription
          : 'twitch authorization was not granted',
      );
    }

    const session = await this.session(request);
    if (!session) {
      throw new UnauthorizedException('admin session required');
    }

    const { channel } = await this.asAdmin(session, request, () => {
      return this.twitch.completeAuthorization({
        code,
        redirect_uri: this.config.redirectUri,
      });
    });
    response.json({ channel });
  }

  private session(request: Request): Promise<Nullable<AdminSession>> {
    return this.cookies.open<AdminSession>(
      parse(request.headers.cookie ?? '')[ADMIN_COOKIES.SESSION],
    );
  }

  private asAdmin<T>(
    session: AdminSession,
    request: Request,
    call: () => Observable<T>,
  ): Promise<T> {
    const actor = adminActor(session, request.ip ?? null);
    return firstValueFrom(this.actors.run(actor, call));
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.adminConfig.secureCookies,
      path: ADMIN_PATHS.TWITCH,
      maxAge: TWITCH_STATE_TTL_SECONDS * 1000,
    };
  }
}
