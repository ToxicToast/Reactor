import type { OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  TWITCH_SERVICE_NAME,
  type CreateTwitchWebhookRequest,
  type CreateTwitchWebhookResponse,
  type DeleteTwitchWebhookResponse,
  type GetLeaderboardRequest,
  type GetLeaderboardResponse,
  type GetSessionResponse,
  type GetTimelineRequest,
  type GetTimelineResponse,
  type ListChatMessagesRequest,
  type ListChatMessagesResponse,
  type ListPollsRequest,
  type ListPollsResponse,
  type ListRewardsRequest,
  type ListRewardsResponse,
  type ListSessionsRequest,
  type ListSessionsResponse,
  type ListStatsChannelsResponse,
  type ListTwitchWebhookDeliveriesRequest,
  type ListTwitchWebhookDeliveriesResponse,
  type ListTwitchWebhooksResponse,
  type RotateTwitchWebhookSecretResponse,
  type TwitchServiceClient,
  type UpdateTwitchWebhookRequest,
  type UpdateTwitchWebhookResponse,
  type WatchEventsRequest,
  type WatchEventsResponse,
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

  // ── Stats ─────────────────────────────────────

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

  listChatMessages(
    request: ListChatMessagesRequest,
  ): Observable<ListChatMessagesResponse> {
    return this.twitch().listChatMessages(request, this.metadata.current());
  }

  // ── Streams ───────────────────────────────────

  watchLive(): Observable<WatchLiveResponse> {
    return this.twitch().watchLive({}, this.metadata.current());
  }

  watchEvents(request: WatchEventsRequest): Observable<WatchEventsResponse> {
    return this.twitch().watchEvents(request, this.metadata.current());
  }

  // ── Webhooks ──────────────────────────────────

  createWebhook(
    request: CreateTwitchWebhookRequest,
  ): Observable<CreateTwitchWebhookResponse> {
    return this.twitch().createTwitchWebhook(request, this.metadata.current());
  }

  listWebhooks(): Observable<ListTwitchWebhooksResponse> {
    return this.twitch().listTwitchWebhooks({}, this.metadata.current());
  }

  updateWebhook(
    request: UpdateTwitchWebhookRequest,
  ): Observable<UpdateTwitchWebhookResponse> {
    return this.twitch().updateTwitchWebhook(request, this.metadata.current());
  }

  deleteWebhook(id: string): Observable<DeleteTwitchWebhookResponse> {
    return this.twitch().deleteTwitchWebhook({ id }, this.metadata.current());
  }

  rotateWebhookSecret(
    id: string,
  ): Observable<RotateTwitchWebhookSecretResponse> {
    return this.twitch().rotateTwitchWebhookSecret(
      { id },
      this.metadata.current(),
    );
  }

  listWebhookDeliveries(
    request: ListTwitchWebhookDeliveriesRequest,
  ): Observable<ListTwitchWebhookDeliveriesResponse> {
    return this.twitch().listTwitchWebhookDeliveries(
      request,
      this.metadata.current(),
    );
  }

  private twitch(): TwitchServiceClient {
    if (!this.client) {
      throw new Error('Twitch service client is not initialized');
    }
    return this.client;
  }
}
