import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { OAuthConnectOptions } from '../../admin/interfaces/index.js';
import { OAuthConnectFlow } from '../../admin/services/index.js';
import { GATEWAY_TOKENS } from '../../constants/index.js';
import { twitchConnectOptions } from '../functions/index.js';
import type { TwitchAdminConfig } from '../interfaces/index.js';
import { TwitchGateway } from '../twitch.gateway.js';

@ApiExcludeController()
@Controller('admin/twitch')
export class TwitchConnectController {
  private readonly options: OAuthConnectOptions;

  constructor(
    private readonly flow: OAuthConnectFlow,
    private readonly twitch: TwitchGateway,
    @Inject(GATEWAY_TOKENS.TWITCH_ADMIN_CONFIG)
    config: TwitchAdminConfig,
  ) {
    this.options = twitchConnectOptions(config);
  }

  @Get('connect')
  connect(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.flow.connect(
      request,
      response,
      this.options,
      (state, redirectUri) => {
        return this.twitch.startAuthorization({
          state,
          redirect_uri: redirectUri,
        });
      },
    );
  }

  @Get('callback')
  async callback(
    @Query('code') code: unknown,
    @Query('state') state: unknown,
    @Query('error_description') errorDescription: unknown,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const { channel } = await this.flow.complete(
      { code, state, error_description: errorDescription },
      request,
      response,
      this.options,
      (authorizationCode, redirectUri) => {
        return this.twitch.completeAuthorization({
          code: authorizationCode,
          redirect_uri: redirectUri,
        });
      },
    );
    response.json({ channel });
  }
}
