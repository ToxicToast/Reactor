import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  TwitchFollowState,
  type ListFollowsResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import {
  ChannelIdParamDto,
  FollowListResponseDto,
  FollowQueryDto,
} from '../dtos/index.js';
import { TwitchServiceGateway } from '../twitch-service.gateway.js';

@ApiTags('Admin · Twitch')
@ApiBearerAuth()
@Controller('api/v1/admin/twitch/follows')
export class TwitchFollowsController {
  constructor(private readonly twitch: TwitchServiceGateway) {}

  @Get(':channel_id')
  @ApiOkResponse({ type: FollowListResponseDto })
  list(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() { state, ...query }: FollowQueryDto,
  ): Observable<ListFollowsResponse> {
    return this.twitch.listFollows({
      channel_id,
      ...query,
      state: state ?? TwitchFollowState.TWITCH_FOLLOW_STATE_UNSPECIFIED,
    });
  }
}
