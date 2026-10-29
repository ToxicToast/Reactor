import { Controller, Inject } from '@nestjs/common';
import {
  TwitchPermission,
  TwitchServiceControllerMethods,
  type CreateTwitchWebhookRequest,
  type CreateTwitchWebhookResponse,
  type DeleteTwitchWebhookRequest,
  type DeleteTwitchWebhookResponse,
  type GetLeaderboardRequest,
  type GetLeaderboardResponse,
  type GetSessionRequest,
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
  type ListTwitchWebhookDeliveriesRequest,
  type ListTwitchWebhookDeliveriesResponse,
  type ListTwitchWebhooksResponse,
  type RotateTwitchWebhookSecretRequest,
  type RotateTwitchWebhookSecretResponse,
  type TwitchServiceController,
  type UpdateTwitchWebhookRequest,
  type UpdateTwitchWebhookResponse,
  type WatchEventsRequest,
  type WatchEventsResponse,
  type WatchLiveResponse,
  ListChatMessagesRequest,
  ListChatMessagesResponse,
} from '@toxictoast/contracts-grpc';
import {
  mapEnum,
  mapOptionalEnum,
  parseId,
  parseOptionalUuid,
  requireDate,
  requirePermission,
  unwrap,
} from '@toxictoast/shared-grpc';
import { ActorProvider } from '@toxictoast/shared-kernel';
import {
  CreateWebhookUseCase,
  DeleteWebhookUseCase,
  ListWebhookDeliveriesUseCase,
  ListWebhooksUseCase,
  RotateWebhookSecretUseCase,
  UpdateWebhookUseCase,
} from '@toxictoast/shared-webhooks-application';
import {
  GetLeaderboardUseCase,
  GetLiveStatusUseCase,
  GetSessionUseCase,
  GetTimelineUseCase,
  ListChatMessagesUseCase,
  ListPollsUseCase,
  ListRewardsUseCase,
  ListSessionsUseCase,
  ListStatsChannelsUseCase,
  type LiveChannel,
  type TwitchFeedSource,
} from '@toxictoast/twitch-application';
import { Observable } from 'rxjs';
import {
  LEADERBOARD_METRIC_MAP,
  TIMELINE_INTERVAL_MAP,
  TIMELINE_METRIC_MAP,
  TWITCH_API_TOKENS,
  WEBHOOK_DELIVERY_STATUS_FROM_PROTO,
} from '../constants/index.js';
import {
  eventFilterOf,
  parseChannelId,
  rangeQueryOf,
} from '../functions/index.js';
import {
  TwitchStatsGrpcMapper,
  TwitchWebhookGrpcMapper,
} from '../mappers/index.js';

@Controller()
@TwitchServiceControllerMethods()
export class TwitchGrpcController implements TwitchServiceController {
  private readonly stats = new TwitchStatsGrpcMapper();
  private readonly webhooks = new TwitchWebhookGrpcMapper();

  constructor(
    private readonly listStatsChannelsUseCase: ListStatsChannelsUseCase,
    private readonly getLiveStatusUseCase: GetLiveStatusUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly getLeaderboardUseCase: GetLeaderboardUseCase,
    private readonly getTimelineUseCase: GetTimelineUseCase,
    private readonly listRewardsUseCase: ListRewardsUseCase,
    private readonly listPollsUseCase: ListPollsUseCase,
    private readonly listChatMessagesUseCase: ListChatMessagesUseCase,
    private readonly createWebhookUseCase: CreateWebhookUseCase,
    private readonly listWebhooksUseCase: ListWebhooksUseCase,
    private readonly updateWebhookUseCase: UpdateWebhookUseCase,
    private readonly deleteWebhookUseCase: DeleteWebhookUseCase,
    private readonly rotateWebhookSecretUseCase: RotateWebhookSecretUseCase,
    private readonly listWebhookDeliveriesUseCase: ListWebhookDeliveriesUseCase,
    @Inject(TWITCH_API_TOKENS.FEED_SOURCE)
    private readonly feed: TwitchFeedSource,
    private readonly actors: ActorProvider,
  ) {}

  // ── Stats (öffentlich) ────────────────────────

  async listStatsChannels(): Promise<ListStatsChannelsResponse> {
    const channels = unwrap(await this.listStatsChannelsUseCase.execute());
    return {
      channels: channels.map((channel) => this.stats.toChannel(channel)),
    };
  }

  async listSessions(
    request: ListSessionsRequest,
  ): Promise<ListSessionsResponse> {
    const sessions = unwrap(
      await this.listSessionsUseCase.execute({
        ...rangeQueryOf(request),
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return {
      sessions: sessions.map((session) => this.stats.toSession(session)),
    };
  }

  async getSession(request: GetSessionRequest): Promise<GetSessionResponse> {
    const session = unwrap(
      await this.getSessionUseCase.execute({
        id: parseId<'StreamSession'>(request.id),
      }),
    );
    return { session: this.stats.toSession(session) };
  }

  async getLeaderboard(
    request: GetLeaderboardRequest,
  ): Promise<GetLeaderboardResponse> {
    const entries = unwrap(
      await this.getLeaderboardUseCase.execute({
        ...rangeQueryOf(request),
        metric: mapEnum(LEADERBOARD_METRIC_MAP, request.metric, 'metric'),
        limit: request.limit,
      }),
    );
    return { entries };
  }

  async getTimeline(request: GetTimelineRequest): Promise<GetTimelineResponse> {
    const points = unwrap(
      await this.getTimelineUseCase.execute({
        channel_id: parseChannelId(request.channel_id),
        metric: mapEnum(TIMELINE_METRIC_MAP, request.metric, 'metric'),
        interval: mapEnum(TIMELINE_INTERVAL_MAP, request.interval, 'interval'),
        from: requireDate(request.from, 'from'),
        to: requireDate(request.to, 'to'),
      }),
    );
    return { points };
  }

  async listRewards(request: ListRewardsRequest): Promise<ListRewardsResponse> {
    const rewards = unwrap(
      await this.listRewardsUseCase.execute(rangeQueryOf(request)),
    );
    return { rewards };
  }

  async listPolls(request: ListPollsRequest): Promise<ListPollsResponse> {
    const polls = unwrap(
      await this.listPollsUseCase.execute({
        ...rangeQueryOf(request),
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return { polls: polls.map((poll) => this.stats.toPoll(poll)) };
  }

  /** Chat-Texte sind kein öffentlicher Stats-Wert, deshalb wie WatchEvents nur mit twitch.stats.read. */
  async listChatMessages(
    request: ListChatMessagesRequest,
  ): Promise<ListChatMessagesResponse> {
    requirePermission(this.actors.current(), TwitchPermission.STATS_READ);
    const messages = unwrap(
      await this.listChatMessagesUseCase.execute({
        ...rangeQueryOf(request),
        user_id: request.user_id
          ? parseChannelId(request.user_id, 'user_id')
          : undefined,
        session_id: parseOptionalUuid(request.session_id, 'session_id'),
        query: request.query,
        include_deleted: request.include_deleted,
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return {
      messages: messages.map((message) => this.stats.toChatMessage(message)),
    };
  }

  // ── Streams ───────────────────────────────────

  /** Erst der aktuelle Stand, dann jede Änderung; kam schon eine Änderung, entfällt der veraltete Stand. */
  watchLive(): Observable<WatchLiveResponse> {
    return new Observable<WatchLiveResponse>((subscriber) => {
      let updated = false;
      const unsubscribe = this.feed.onLive((channels) => {
        updated = true;
        subscriber.next(this.liveResponse(channels));
      });

      void this.getLiveStatusUseCase
        .execute()
        .then((result) => {
          if (!updated) {
            subscriber.next(this.liveResponse(unwrap(result)));
          }
        })
        .catch((error: unknown) => {
          subscriber.error(error);
        });

      return unsubscribe;
    });
  }

  watchEvents(request: WatchEventsRequest): Observable<WatchEventsResponse> {
    requirePermission(this.actors.current(), TwitchPermission.STATS_READ);
    const matches = eventFilterOf(request);

    return new Observable<WatchEventsResponse>((subscriber) => {
      return this.feed.onEvent((event) => {
        if (matches(event)) {
          subscriber.next({ event: this.stats.toEvent(event) });
        }
      });
    });
  }

  // ── Webhooks (twitch.webhook.manage) ──────────

  async createTwitchWebhook(
    request: CreateTwitchWebhookRequest,
  ): Promise<CreateTwitchWebhookResponse> {
    this.requireWebhookManage();
    const { webhook, secret } = unwrap(
      await this.createWebhookUseCase.execute({
        url: request.url,
        events: request.events,
        description: request.description,
      }),
    );
    return { webhook: this.webhooks.toWebhook(webhook), secret };
  }

  async listTwitchWebhooks(): Promise<ListTwitchWebhooksResponse> {
    this.requireWebhookManage();
    const webhooks = unwrap(await this.listWebhooksUseCase.execute());
    return {
      webhooks: webhooks.map((webhook) => this.webhooks.toWebhook(webhook)),
    };
  }

  async updateTwitchWebhook(
    request: UpdateTwitchWebhookRequest,
  ): Promise<UpdateTwitchWebhookResponse> {
    this.requireWebhookManage();
    const webhook = unwrap(
      await this.updateWebhookUseCase.execute({
        id: parseId(request.id),
        url: request.url,
        events: request.events,
        description: request.description,
        active: request.active,
      }),
    );
    return { webhook: this.webhooks.toWebhook(webhook) };
  }

  async deleteTwitchWebhook(
    request: DeleteTwitchWebhookRequest,
  ): Promise<DeleteTwitchWebhookResponse> {
    this.requireWebhookManage();
    const webhook = unwrap(
      await this.deleteWebhookUseCase.execute({ id: parseId(request.id) }),
    );
    return { webhook: this.webhooks.toWebhook(webhook) };
  }

  async rotateTwitchWebhookSecret(
    request: RotateTwitchWebhookSecretRequest,
  ): Promise<RotateTwitchWebhookSecretResponse> {
    this.requireWebhookManage();
    const { webhook, secret } = unwrap(
      await this.rotateWebhookSecretUseCase.execute({
        id: parseId(request.id),
      }),
    );
    return { webhook: this.webhooks.toWebhook(webhook), secret };
  }

  async listTwitchWebhookDeliveries(
    request: ListTwitchWebhookDeliveriesRequest,
  ): Promise<ListTwitchWebhookDeliveriesResponse> {
    this.requireWebhookManage();
    const deliveries = unwrap(
      await this.listWebhookDeliveriesUseCase.execute({
        webhook_id: parseId(request.webhook_id, 'webhook_id'),
        status: mapOptionalEnum(
          WEBHOOK_DELIVERY_STATUS_FROM_PROTO,
          request.status,
          'status',
        ),
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return {
      deliveries: deliveries.map((delivery) => {
        return this.webhooks.toDelivery(delivery);
      }),
    };
  }

  private liveResponse(
    channels: ReadonlyArray<LiveChannel>,
  ): WatchLiveResponse {
    return {
      channels: channels.map((channel) => this.stats.toLiveChannel(channel)),
    };
  }

  private requireWebhookManage(): void {
    requirePermission(this.actors.current(), TwitchPermission.WEBHOOK_MANAGE);
  }
}
