import {
  Controller,
  Get,
  Param,
  Query,
  Sse,
  type MessageEvent,
} from '@nestjs/common';
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import type {
  GetLeaderboardResponse,
  GetSessionResponse,
  GetTimelineResponse,
  ListPollsResponse,
  ListRewardsResponse,
  ListSessionsResponse,
  ListStatsChannelsResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { IdParamDto } from '../../../common/dtos/index.js';
import { sseStream } from '../../../common/functions/index.js';
import { TWITCH_SSE_EVENTS } from '../constants/index.js';
import {
  ChannelIdParamDto,
  LeaderboardQueryDto,
  LeaderboardResponseDto,
  PollListResponseDto,
  RewardListResponseDto,
  StatsChannelListResponseDto,
  StreamSessionListResponseDto,
  StreamSessionResponseDto,
  TimelineQueryDto,
  TimelineResponseDto,
  TwitchPagedRangeQueryDto,
  TwitchRangeQueryDto,
} from '../dtos/index.js';
import { TwitchServiceGateway } from '../twitch-service.gateway.js';

@ApiTags('Twitch · Stats')
@Controller('api/v1/twitch')
export class TwitchStatsController {
  constructor(private readonly twitch: TwitchServiceGateway) {}

  @Get('channels')
  @ApiOkResponse({ type: StatsChannelListResponseDto })
  channels(): Observable<ListStatsChannelsResponse> {
    return this.twitch.listChannels();
  }

  @Get('channels/:channel_id/sessions')
  @ApiOkResponse({ type: StreamSessionListResponseDto })
  sessions(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() query: TwitchPagedRangeQueryDto,
  ): Observable<ListSessionsResponse> {
    return this.twitch.listSessions({ channel_id, ...query });
  }

  @Get('sessions/:id')
  @ApiOkResponse({ type: StreamSessionResponseDto })
  session(@Param() { id }: IdParamDto): Observable<GetSessionResponse> {
    return this.twitch.getSession(id);
  }

  @Get('channels/:channel_id/leaderboard')
  @ApiOkResponse({ type: LeaderboardResponseDto })
  leaderboard(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() query: LeaderboardQueryDto,
  ): Observable<GetLeaderboardResponse> {
    return this.twitch.getLeaderboard({ channel_id, ...query });
  }

  @Get('channels/:channel_id/timeline')
  @ApiOkResponse({ type: TimelineResponseDto })
  timeline(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() query: TimelineQueryDto,
  ): Observable<GetTimelineResponse> {
    return this.twitch.getTimeline({ channel_id, ...query });
  }

  @Get('channels/:channel_id/rewards')
  @ApiOkResponse({ type: RewardListResponseDto })
  rewards(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() query: TwitchRangeQueryDto,
  ): Observable<ListRewardsResponse> {
    return this.twitch.listRewards({ channel_id, ...query });
  }

  @Get('channels/:channel_id/polls')
  @ApiOkResponse({ type: PollListResponseDto })
  polls(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() query: TwitchPagedRangeQueryDto,
  ): Observable<ListPollsResponse> {
    return this.twitch.listPolls({ channel_id, ...query });
  }

  @Sse('live')
  @ApiProduces('text/event-stream')
  @ApiOkResponse({
    description:
      'Server-Sent Events: `live` mit allen Channels, sofort und bei jeder Änderung; `ping` alle 25 s',
  })
  live(): Observable<MessageEvent> {
    return sseStream(this.twitch.watchLive(), TWITCH_SSE_EVENTS.LIVE);
  }
}
