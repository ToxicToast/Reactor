import type { OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  TWITCH_SERVICE_NAME,
  type GetLeaderboardRequest,
  type GetLeaderboardResponse,
  type GetSessionResponse,
  type GetTimelineRequest,
  type GetTimelineResponse,
  type ListPollsRequest,
  type ListPollsResponse,
  type ListRewardsRequest,
  type ListRewardsResponse,
  type ListSessionsRequest,
  type ListSessionsResponse,
  type ListStatsChannelsResponse,
  type TwitchServiceClient,
  type WatchLiveResponse,
} from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class TwitchServiceGateway implements OnModuleInit {
  private client: Nullable<TwitchServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: RequestMetadata,
  ) {}

  onModuleInit(): void {
    this.client =
      this.grpc.getService<TwitchServiceClient>(TWITCH_SERVICE_NAME);
  }

  listChannels(): Observable<ListStatsChannelsResponse> {
    return this.twitch().listStatsChannels({}, this.metadata.current());
  }

  listSessions(request: ListSessionsRequest): Observable<ListSessionsResponse> {
    return this.twitch().listSessions(request, this.metadata.current());
  }

  getSession(id: string): Observable<GetSessionResponse> {
    return this.twitch().getSession({ id }, this.metadata.current());
  }

  getLeaderboard(
    request: GetLeaderboardRequest,
  ): Observable<GetLeaderboardResponse> {
    return this.twitch().getLeaderboard(request, this.metadata.current());
  }

  getTimeline(request: GetTimelineRequest): Observable<GetTimelineResponse> {
    return this.twitch().getTimeline(request, this.metadata.current());
  }

  listRewards(request: ListRewardsRequest): Observable<ListRewardsResponse> {
    return this.twitch().listRewards(request, this.metadata.current());
  }

  listPolls(request: ListPollsRequest): Observable<ListPollsResponse> {
    return this.twitch().listPolls(request, this.metadata.current());
  }

  watchLive(): Observable<WatchLiveResponse> {
    return this.twitch().watchLive({}, this.metadata.current());
  }

  private twitch(): TwitchServiceClient {
    if (!this.client) {
      throw new Error('Twitch service client is not initialized');
    }
    return this.client;
  }
}
