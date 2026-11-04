import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { Actor } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import { parse } from 'cookie';
import type { Request } from 'express';
import { ADMIN_COOKIES, ADMIN_MESSAGES } from '../constants/index.js';
import { adminActor, missingPermissionMessage } from '../functions/index.js';
import type { AdminSession } from '../interfaces/index.js';
import type { SealedCookie } from './sealed-cookie.service.js';

export class AdminSessions {
  constructor(private readonly cookies: SealedCookie) {}

  open(request: Request): Promise<Nullable<AdminSession>> {
    return this.cookies.open<AdminSession>(
      parse(request.headers.cookie ?? '')[ADMIN_COOKIES.SESSION],
    );
  }

  async requireActor(request: Request, permission: string): Promise<Actor> {
    const session = await this.open(request);
    if (!session) {
      throw new UnauthorizedException(ADMIN_MESSAGES.SESSION_REQUIRED);
    }
    if (!session.permissions.includes(permission)) {
      throw new ForbiddenException(missingPermissionMessage(permission));
    }
    return adminActor(session, request.ip ?? null);
  }
}
