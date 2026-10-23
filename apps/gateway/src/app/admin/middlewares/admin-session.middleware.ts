import { HttpStatus, Injectable } from '@nestjs/common';
import { parse } from 'cookie';
import type { NextFunction, Request, Response } from 'express';
import {
  ADMIN_COOKIES,
  ADMIN_PATHS,
  AdminPermission,
} from '../constants/index.js';
import type { AdminSession } from '../interfaces/index.js';
import { SealedCookie } from '../services/index.js';

@Injectable()
export class AdminSessionMiddleware {
  constructor(private readonly cookies: SealedCookie) {}

  async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const session = await this.cookies.open<AdminSession>(
      parse(request.headers.cookie ?? '')[ADMIN_COOKIES.SESSION],
    );

    if (!session) {
      if (request.method === 'GET' && request.accepts('html')) {
        const returnTo = encodeURIComponent(request.originalUrl);
        response.redirect(`${ADMIN_PATHS.LOGIN}?return_to=${returnTo}`);
        return;
      }
      response.status(HttpStatus.UNAUTHORIZED).json({
        status_code: HttpStatus.UNAUTHORIZED,
        message: 'admin session required',
      });
      return;
    }

    if (!session.permissions.includes(AdminPermission.QUEUES_MANAGE)) {
      response.status(HttpStatus.FORBIDDEN).json({
        status_code: HttpStatus.FORBIDDEN,
        message: `missing permission ${AdminPermission.QUEUES_MANAGE}`,
      });
      return;
    }

    next();
  }
}
