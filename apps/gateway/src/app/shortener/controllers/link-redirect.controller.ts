import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { IdParamDto } from '../../common/dtos/index.js';
import { SHORTENER_REDIRECT } from '../constants/index.js';
import { LinkGateway } from '../link.gateway.js';
import { LinkClickReporter } from '../services/index.js';

@ApiExcludeController()
@Controller('shortener')
export class LinkRedirectController {
  constructor(
    private readonly links: LinkGateway,
    private readonly clicks: LinkClickReporter,
  ) {}

  /** Unbekannte, gelöschte und deaktivierte Links landen als 404 im GrpcExceptionFilter. */
  @Get(':id')
  async redirect(
    @Param() { id }: IdParamDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const { target_url } = await firstValueFrom(this.links.resolve(id));
    this.clicks.report(id, request);
    response
      .setHeader('Cache-Control', SHORTENER_REDIRECT.CACHE_CONTROL)
      .redirect(SHORTENER_REDIRECT.STATUS, target_url);
  }
}
