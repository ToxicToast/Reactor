import { status } from '@grpc/grpc-js';
import {
  LeaderboardMetric,
  TimelineInterval,
  TimelineMetric,
  TwitchPermission,
  type WatchEventsResponse,
  type WatchLiveResponse,
} from '@toxictoast/contracts-grpc';
import {
  anonymousTestActor,
  grpcCode,
  TestActorProvider,
  testActor,
} from '@toxictoast/shared-grpc';
import {
  CreateWebhookUseCase,
  DeleteWebhookUseCase,
  FixedWebhookSecretGenerator,
  ListWebhookDeliveriesUseCase,
  ListWebhooksUseCase,
  RotateWebhookSecretUseCase,
  UpdateWebhookUseCase,
} from '@toxictoast/shared-webhooks-application';
import { WebhookFactory } from '@toxictoast/shared-webhooks-domain';
import {
  ChatChangeKinds,
  GetLeaderboardUseCase,
  GetLiveStatusUseCase,
  GetSessionUseCase,
  GetTimelineUseCase,
  ListChatMessagesUseCase,
  ListPollsUseCase,
  ListRewardsUseCase,
  ListSessionsUseCase,
  ListStatsChannelsUseCase,
  observation,
  postedChatMessage,
  TWITCH_TEST_CHANNEL,
  TwitchTestHarness,
  viewer,
} from '@toxictoast/twitch-application';
import { ObservationKinds } from '@toxictoast/twitch-domain';
import { TwitchGrpcController } from './twitch-grpc.controller.js';
import { createUuidTestContext } from '@toxictoast/shared-application';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;
const UNKNOWN_ID = '0192f3a0-0000-7000-8000-0000000000ff';

const flush = (): Promise<void> => {
  return new Promise((resolve) => setImmediate(resolve));
};

describe('TwitchGrpcController', () => {
  let harness: TwitchTestHarness;
  let actors: TestActorProvider;
  let controller: TwitchGrpcController;

  const goOnline = () => {
    return harness.observe(
      observation({
        kind: ObservationKinds.STREAM_ONLINE,
        stream_id: 'stream-1',
      }),
      'twitch.stream',
      'online',
    );
  };

  beforeEach(() => {
    harness = new TwitchTestHarness();
    actors = new TestActorProvider(anonymousTestActor());
    const webhookFactory = new WebhookFactory(
      createUuidTestContext(new Date('2026-10-28T20:00:00Z')),
    );
    const secrets = new FixedWebhookSecretGenerator();

    controller = new TwitchGrpcController(
      new ListStatsChannelsUseCase(harness.directory, harness.sessions),
      new GetLiveStatusUseCase(harness.liveStatus),
      new ListSessionsUseCase(harness.sessions),
      new GetSessionUseCase(harness.sessions),
      new GetLeaderboardUseCase(harness.viewerStats, harness.config),
      new GetTimelineUseCase(harness.channelStats, harness.config),
      new ListRewardsUseCase(harness.rewards, harness.config),
      new ListPollsUseCase(harness.polls),
      new ListChatMessagesUseCase(harness.chatMessages),
      new CreateWebhookUseCase(webhookFactory, harness.webhooks, secrets),
      new ListWebhooksUseCase(harness.webhooks),
      new UpdateWebhookUseCase(webhookFactory, harness.webhooks),
      new DeleteWebhookUseCase(webhookFactory, harness.webhooks),
      new RotateWebhookSecretUseCase(webhookFactory, harness.webhooks, secrets),
      new ListWebhookDeliveriesUseCase(harness.webhooks, harness.deliveries),
      harness.feed,
      actors,
    );
  });

  describe('stats', () => {
    it('answers stats queries without a signed-in actor', async () => {
      await goOnline();
      await harness.observe(observation({ user: viewer('1') }));

      const channels = await controller.listStatsChannels();
      const leaderboard = await controller.getLeaderboard({
        channel_id: CHANNEL_ID,
        metric: LeaderboardMetric.LEADERBOARD_METRIC_MESSAGES,
      });
      const sessions = await controller.listSessions({
        channel_id: CHANNEL_ID,
      });

      expect(channels.channels).toEqual([
        expect.objectContaining({ login: 'toxictoast', live: true }),
      ]);
      expect(leaderboard.entries).toEqual([
        { user_id: '1', user_login: 'user1', user_name: 'User1', value: 1 },
      ]);
      expect(sessions.sessions).toEqual([
        expect.objectContaining({
          stream_id: 'stream-1',
          messages: 1,
          ended_at: undefined,
        }),
      ]);
    });

    it('requires the stats permission for the chat log', async () => {
      expect(
        await grpcCode(
          controller.listChatMessages({
            channel_id: CHANNEL_ID,
            include_deleted: false,
          }),
        ),
      ).toBe(status.UNAUTHENTICATED);
    });

    it('lists chat messages for readers', async () => {
      actors.actor = testActor([TwitchPermission.STATS_READ]);
      await harness.chat({
        kind: ChatChangeKinds.POSTED,
        message: postedChatMessage('m1', { text: 'Hallo Chat' }),
      });

      const response = await controller.listChatMessages({
        channel_id: CHANNEL_ID,
        query: 'hallo',
        include_deleted: false,
      });

      expect(response.messages).toEqual([
        expect.objectContaining({
          message_id: 'm1',
          text: 'Hallo Chat',
          deleted_at: undefined,
        }),
      ]);
    });

    it('rejects invalid arguments', async () => {
      expect(
        await grpcCode(
          controller.getTimeline({
            channel_id: CHANNEL_ID,
            metric: TimelineMetric.TIMELINE_METRIC_UNSPECIFIED,
            interval: TimelineInterval.TIMELINE_INTERVAL_DAY,
            from: '2026-10-01T00:00:00Z',
            to: '2026-10-31T00:00:00Z',
          }),
        ),
      ).toBe(status.INVALID_ARGUMENT);
      expect(
        await grpcCode(
          controller.getTimeline({
            channel_id: CHANNEL_ID,
            metric: TimelineMetric.TIMELINE_METRIC_MESSAGES,
            interval: TimelineInterval.TIMELINE_INTERVAL_DAY,
            from: '',
            to: '2026-10-31T00:00:00Z',
          }),
        ),
      ).toBe(status.INVALID_ARGUMENT);
      expect(
        await grpcCode(controller.listSessions({ channel_id: 'toxictoast' })),
      ).toBe(status.INVALID_ARGUMENT);
      expect(await grpcCode(controller.getSession({ id: 'nope' }))).toBe(
        status.INVALID_ARGUMENT,
      );
    });

    it('reports unknown sessions', async () => {
      expect(await grpcCode(controller.getSession({ id: UNKNOWN_ID }))).toBe(
        status.NOT_FOUND,
      );
    });
  });

  describe('streams', () => {
    it('sends the live snapshot and then every change', async () => {
      const received: Array<WatchLiveResponse> = [];
      const subscription = controller
        .watchLive()
        .subscribe((response) => received.push(response));

      await flush();
      await goOnline();
      subscription.unsubscribe();
      await harness.observe(
        observation({ kind: ObservationKinds.STREAM_OFFLINE }),
        'twitch.stream',
        'offline',
      );

      expect(
        received.map((response) =>
          response.channels.map((channel) => channel.live),
        ),
      ).toEqual([[], [true]]);
    });

    it('requires the stats permission for raw events', async () => {
      expect(
        await grpcCode(
          Promise.resolve().then(() => controller.watchEvents({ topics: [] })),
        ),
      ).toBe(status.UNAUTHENTICATED);
    });

    it('streams raw events filtered by topic', async () => {
      actors.actor = testActor([TwitchPermission.STATS_READ]);
      const received: Array<WatchEventsResponse> = [];
      const subscription = controller
        .watchEvents({ channel_id: CHANNEL_ID, topics: ['twitch.stream'] })
        .subscribe((response) => received.push(response));

      await harness.observe(observation({ user: viewer('1') }));
      await goOnline();
      subscription.unsubscribe();

      expect(received.map((response) => response.event?.topic)).toEqual([
        'twitch.stream',
      ]);
      expect(JSON.parse(received[0].event?.payload_json ?? '{}')).toEqual({
        channel_login: 'toxictoast',
      });
    });
  });

  describe('webhooks', () => {
    it('requires the webhook permission', async () => {
      actors.actor = testActor([TwitchPermission.STATS_READ]);

      expect(await grpcCode(controller.listTwitchWebhooks())).toBe(
        status.PERMISSION_DENIED,
      );
    });

    it('returns the secret only on create and rotate', async () => {
      actors.actor = testActor([TwitchPermission.WEBHOOK_MANAGE]);

      const created = await controller.createTwitchWebhook({
        url: 'https://hooks.example.com/twitch',
        events: ['twitch.stream.*'],
      });
      const rotated = await controller.rotateTwitchWebhookSecret({
        id: created.webhook?.id ?? '',
      });
      const listed = await controller.listTwitchWebhooks();

      expect(created.secret).toBe('whsec_1');
      expect(rotated.secret).toBe('whsec_2');
      expect(listed.webhooks).toHaveLength(1);
      expect(listed.webhooks[0]).not.toHaveProperty('secret');
    });
  });
});
