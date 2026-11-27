import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { ActorContext } from '@toxictoast/shared-system';
import type { Request, Response } from 'express';
import { firstValueFrom, type Observable } from 'rxjs';
import {
  ADMIN_MESSAGES,
  ADMIN_PATHS,
  OAUTH_CONNECT,
} from '../constants/index.js';
import { adminActor, randomToken } from '../functions/index.js';
import type {
  AdminSession,
  OAuthCallbackQuery,
  OAuthConnectOptions,
  OAuthConnectState,
} from '../interfaces/index.js';
import type { AdminSessions } from './admin-sessions.service.js';
import type { SealedCookie } from './sealed-cookie.service.js';

/** Plattform-Login für eingeloggte Admins; gemeinsam für Twitch, YouTube, Instagram und TikTok */
export class OAuthConnectFlow {
  constructor(
    private readonly cookies: SealedCookie,
    private readonly sessions: AdminSessions,
    private readonly actors: ActorContext,
  ) {}

  async connect(
    request: Request,
    response: Response,
    options: OAuthConnectOptions,
    start: (state: string, redirectUri: string) => Observable<{ url: string }>,
  ): Promise<void> {
    const session = await this.sessions.open(request);
    if (!session) {
      const returnTo = encodeURIComponent(options.connectPath);
      response.redirect(`${ADMIN_PATHS.LOGIN}?return_to=${returnTo}`);
      return;
    }

    const state = randomToken();
    const { url } = await this.asAdmin(session, request, () => {
      return start(state, options.redirectUri);
    });

    const connect: OAuthConnectState = { state };
    await this.cookies.write(
      response,
      options.cookie,
      connect,
      options.path,
      OAUTH_CONNECT.STATE_TTL_SECONDS,
    );
    response.redirect(url);
  }

  async complete<T>(
    query: OAuthCallbackQuery,
    request: Request,
    response: Response,
    options: OAuthConnectOptions,
    complete: (code: string, redirectUri: string) => Observable<T>,
  ): Promise<T> {
    const connect = await this.cookies.read<OAuthConnectState>(
      request,
      options.cookie,
    );
    this.cookies.clear(response, options.cookie, options.path);
    if (!connect || query.state !== connect.state) {
      throw new UnauthorizedException(
        `invalid or expired ${options.label} login`,
      );
    }
    const code = query.code;
    if (typeof code !== 'string') {
      throw new BadRequestException(
        typeof query.error_description === 'string'
          ? query.error_description
          : `${options.label} authorization was not granted`,
      );
    }

    const session = await this.sessions.open(request);
    if (!session) {
      throw new UnauthorizedException(ADMIN_MESSAGES.SESSION_REQUIRED);
    }

    return this.asAdmin(session, request, () => {
      return complete(code, options.redirectUri);
    });
  }

  private asAdmin<T>(
    session: AdminSession,
    request: Request,
    call: () => Observable<T>,
  ): Promise<T> {
    const actor = adminActor(session, request.ip ?? null);
    return firstValueFrom(this.actors.run(actor, call));
  }
}
