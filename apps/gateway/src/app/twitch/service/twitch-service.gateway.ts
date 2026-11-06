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
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../../grpc/abstracts/index.js';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class TwitchServiceGateway extends GrpcGateway<TwitchServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, TWITCH_SERVICE_NAME, metadata);
  }

  // ── Stats ─────────────────────────────────────

  listChannels(): Observable<ListStatsChannelsResponse> {
    return this.service.listStatsChannels({}, this.metadata());
  }

  listSessions(request: ListSessionsRequest): Observable<ListSessionsResponse> {
    return this.service.listSessions(request, this.metadata());
  }

  getSession(id: string): Observable<GetSessionResponse> {
    return this.service.getSession({ id }, this.metadata());
  }

  getLeaderboard(
    request: GetLeaderboardRequest,
  ): Observable<GetLeaderboardResponse> {
    return this.service.getLeaderboard(request, this.metadata());
  }

  getTimeline(request: GetTimelineRequest): Observable<GetTimelineResponse> {
    return this.service.getTimeline(request, this.metadata());
  }

  listRewards(request: ListRewardsRequest): Observable<ListRewardsResponse> {
    return this.service.listRewards(request, this.metadata());
  }

  listPolls(request: ListPollsRequest): Observable<ListPollsResponse> {
    return this.service.listPolls(request, this.metadata());
  }

  listChatMessages(
    request: ListChatMessagesRequest,
  ): Observable<ListChatMessagesResponse> {
    return this.service.listChatMessages(request, this.metadata());
  }

  // ── Streams ───────────────────────────────────

  watchLive(): Observable<WatchLiveResponse> {
    return this.service.watchLive({}, this.metadata());
  }

  watchEvents(request: WatchEventsRequest): Observable<WatchEventsResponse> {
    return this.service.watchEvents(request, this.metadata());
  }

  // ── Webhooks ──────────────────────────────────

  createWebhook(
    request: CreateTwitchWebhookRequest,
  ): Observable<CreateTwitchWebhookResponse> {
    return this.service.createTwitchWebhook(request, this.metadata());
  }

  listWebhooks(): Observable<ListTwitchWebhooksResponse> {
    return this.service.listTwitchWebhooks({}, this.metadata());
  }

  updateWebhook(
    request: UpdateTwitchWebhookRequest,
  ): Observable<UpdateTwitchWebhookResponse> {
    return this.service.updateTwitchWebhook(request, this.metadata());
  }

  deleteWebhook(id: string): Observable<DeleteTwitchWebhookResponse> {
    return this.service.deleteTwitchWebhook({ id }, this.metadata());
  }

  rotateWebhookSecret(
    id: string,
  ): Observable<RotateTwitchWebhookSecretResponse> {
    return this.service.rotateTwitchWebhookSecret({ id }, this.metadata());
  }

  listWebhookDeliveries(
    request: ListTwitchWebhookDeliveriesRequest,
  ): Observable<ListTwitchWebhookDeliveriesResponse> {
    return this.service.listTwitchWebhookDeliveries(request, this.metadata());
  }
}
