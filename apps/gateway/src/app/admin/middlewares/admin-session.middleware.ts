import { HttpStatus, Injectable } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  ADMIN_MESSAGES,
  ADMIN_PATHS,
  AdminPermission,
} from '../constants/index.js';
import { missingPermissionMessage } from '../functions/index.js';
import { AdminSessions } from '../services/index.js';

@Injectable()
export class AdminSessionMiddleware {
  constructor(private readonly sessions: AdminSessions) {}

  async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const session = await this.sessions.open(request);

    if (!session) {
      if (request.method === 'GET' && request.accepts('html')) {
        const returnTo = encodeURIComponent(request.originalUrl);
        response.redirect(`${ADMIN_PATHS.LOGIN}?return_to=${returnTo}`);
        return;
      }
      response.status(HttpStatus.UNAUTHORIZED).json({
        status_code: HttpStatus.UNAUTHORIZED,
        message: ADMIN_MESSAGES.SESSION_REQUIRED,
      });
      return;
    }

    if (!session.permissions.includes(AdminPermission.QUEUES_MANAGE)) {
      response.status(HttpStatus.FORBIDDEN).json({
        status_code: HttpStatus.FORBIDDEN,
        message: missingPermissionMessage(AdminPermission.QUEUES_MANAGE),
      });
      return;
    }

    next();
  }
}
