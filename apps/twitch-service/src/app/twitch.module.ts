import { Module } from '@nestjs/common';
import { DomainPersistence } from '@toxictoast/shared-application';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { TransactionContext } from '@toxictoast/shared-persistence';
import { DispatchWebhookEventUseCase } from '@toxictoast/shared-webhooks-application';
import {
  TWITCH_API_TOKENS,
  TwitchEventHandler,
  TwitchGrpcController,
} from '@toxictoast/twitch-api';
import {
  ChatLogRecorder,
  CounterRecorder,
  GetLeaderboardUseCase,
  GetLiveStatusUseCase,
  GetSessionUseCase,
  GetTimelineUseCase,
  ListChatMessagesUseCase,
  ListPollsUseCase,
  ListRewardsUseCase,
  ListSessionsUseCase,
  ListStatsChannelsUseCase,
  LiveStatusReader,
  PresenceTracker,
  RecordTwitchEventUseCase,
  SessionTracker,
} from '@toxictoast/twitch-application';
import { StreamSessionFactory } from '@toxictoast/twitch-domain';
import {
  RedisTwitchFeed,
  twitchStatsConfigFromEnv,
  TypeOrmChannelDirectoryRepository,
  TypeOrmChannelStatsRepository,
  TypeOrmChatMessageRepository,
  TypeOrmChatterActivityRepository,
  TypeOrmPollRepository,
  TypeOrmPresenceRepository,
  TypeOrmRewardStatsRepository,
  TypeOrmStreamSessionRepository,
  TypeOrmTwitchEventLog,
  TypeOrmViewerStatsRepository,
} from '@toxictoast/twitch-infrastructure';
import { DataSource } from 'typeorm';
import { TWITCH_SERVICE_TOKENS } from './constants/index.js';
import { TwitchFeedLifecycle } from './lifecycles/index.js';

const {
  STATS_CONFIG,
  TWITCH_EVENT_LOG,
  STREAM_SESSION_REPOSITORY,
  CHANNEL_STATS_REPOSITORY,
  VIEWER_STATS_REPOSITORY,
  CHATTER_ACTIVITY_REPOSITORY,
  PRESENCE_REPOSITORY,
  REWARD_STATS_REPOSITORY,
  POLL_REPOSITORY,
  CHANNEL_DIRECTORY_REPOSITORY,
  CHAT_MESSAGE_REPOSITORY,
} = TWITCH_SERVICE_TOKENS;

const { DOMAIN_CONTEXT, UNIT_OF_WORK, REDIS, REDIS_SUBSCRIBER } = TOKENS;
const DATABASE = [DataSource, TransactionContext];

@Module({
  controllers: [TwitchGrpcController],
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: STATS_CONFIG,
      useFactory: () => twitchStatsConfigFromEnv(),
    },

    // ── Domain ──────────────────────────────────
    provideClass(StreamSessionFactory, [DOMAIN_CONTEXT]),

    // ── Infrastructure ──────────────────────────
    provideClass(
      TypeOrmStreamSessionRepository,
      DATABASE,
      STREAM_SESSION_REPOSITORY,
    ),
    provideClass(
      TypeOrmChannelStatsRepository,
      DATABASE,
      CHANNEL_STATS_REPOSITORY,
    ),
    provideClass(
      TypeOrmViewerStatsRepository,
      DATABASE,
      VIEWER_STATS_REPOSITORY,
    ),
    provideClass(
      TypeOrmChatterActivityRepository,
      DATABASE,
      CHATTER_ACTIVITY_REPOSITORY,
    ),
    provideClass(TypeOrmPresenceRepository, DATABASE, PRESENCE_REPOSITORY),
    provideClass(
      TypeOrmRewardStatsRepository,
      DATABASE,
      REWARD_STATS_REPOSITORY,
    ),
    provideClass(TypeOrmPollRepository, DATABASE, POLL_REPOSITORY),
    provideClass(
      TypeOrmChatMessageRepository,
      DATABASE,
      CHAT_MESSAGE_REPOSITORY,
    ),
    provideClass(
      TypeOrmChannelDirectoryRepository,
      DATABASE,
      CHANNEL_DIRECTORY_REPOSITORY,
    ),
    provideClass(TypeOrmTwitchEventLog, DATABASE, TWITCH_EVENT_LOG),
    provideClass(RedisTwitchFeed, [REDIS, REDIS_SUBSCRIBER]),
    { provide: TWITCH_API_TOKENS.FEED_SOURCE, useExisting: RedisTwitchFeed },

    // ── Services ────────────────────────────────
    provideClass(LiveStatusReader, [
      CHANNEL_DIRECTORY_REPOSITORY,
      STREAM_SESSION_REPOSITORY,
      PRESENCE_REPOSITORY,
    ]),
    provideClass(SessionTracker, [
      StreamSessionFactory,
      STREAM_SESSION_REPOSITORY,
      PRESENCE_REPOSITORY,
      CHANNEL_STATS_REPOSITORY,
      VIEWER_STATS_REPOSITORY,
      DomainPersistence,
      STATS_CONFIG,
    ]),
    provideClass(PresenceTracker, [
      PRESENCE_REPOSITORY,
      CHANNEL_STATS_REPOSITORY,
      VIEWER_STATS_REPOSITORY,
      SessionTracker,
      STATS_CONFIG,
    ]),
    provideClass(CounterRecorder, [
      CHANNEL_STATS_REPOSITORY,
      VIEWER_STATS_REPOSITORY,
      CHATTER_ACTIVITY_REPOSITORY,
      REWARD_STATS_REPOSITORY,
      STATS_CONFIG,
    ]),
    provideClass(ChatLogRecorder, [
      CHAT_MESSAGE_REPOSITORY,
      STREAM_SESSION_REPOSITORY,
    ]),

    // ── Use Cases ───────────────────────────────
    provideClass(RecordTwitchEventUseCase, [
      TWITCH_EVENT_LOG,
      CHANNEL_DIRECTORY_REPOSITORY,
      StreamSessionFactory,
      STREAM_SESSION_REPOSITORY,
      POLL_REPOSITORY,
      SessionTracker,
      PresenceTracker,
      CounterRecorder,
      ChatLogRecorder,
      DispatchWebhookEventUseCase,
      LiveStatusReader,
      RedisTwitchFeed,
      UNIT_OF_WORK,
    ]),
    provideClass(ListChatMessagesUseCase, [CHAT_MESSAGE_REPOSITORY]),
    provideClass(ListStatsChannelsUseCase, [
      CHANNEL_DIRECTORY_REPOSITORY,
      STREAM_SESSION_REPOSITORY,
    ]),
    provideClass(GetLiveStatusUseCase, [LiveStatusReader]),
    provideClass(ListSessionsUseCase, [STREAM_SESSION_REPOSITORY]),
    provideClass(GetSessionUseCase, [STREAM_SESSION_REPOSITORY]),
    provideClass(GetLeaderboardUseCase, [
      VIEWER_STATS_REPOSITORY,
      STATS_CONFIG,
    ]),
    provideClass(GetTimelineUseCase, [CHANNEL_STATS_REPOSITORY, STATS_CONFIG]),
    provideClass(ListRewardsUseCase, [REWARD_STATS_REPOSITORY, STATS_CONFIG]),
    provideClass(ListPollsUseCase, [POLL_REPOSITORY]),

    TwitchEventHandler,

    // ── Lifecycles ──────────────────────────────
    provideClass(TwitchFeedLifecycle, [RedisTwitchFeed]),
  ],
  exports: [TwitchEventHandler],
})
export class TwitchModule {}
