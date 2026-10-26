import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type {
  DisconnectChannelResponse,
  ListChannelsResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { IdParamDto } from '../../common/dtos/index.js';
import {
  TwitchChannelListResponseDto,
  TwitchChannelResponseDto,
} from '../dtos/index.js';
import { TwitchGateway } from '../twitch.gateway.js';

@ApiTags('Admin · Twitch')
@ApiBearerAuth()
@Controller('api/v1/admin/twitch/channels')
export class TwitchChannelsController {
  constructor(private readonly twitch: TwitchGateway) {}

  @Get()
  @ApiOkResponse({ type: TwitchChannelListResponseDto })
  list(): Observable<ListChannelsResponse> {
    return this.twitch.listChannels();
  }

  @Delete(':id')
  @ApiOkResponse({ type: TwitchChannelResponseDto })
  disconnect(
    @Param() { id }: IdParamDto,
  ): Observable<DisconnectChannelResponse> {
    return this.twitch.disconnectChannel(id);
  }
}
