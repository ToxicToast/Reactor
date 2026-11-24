import { Module } from '@nestjs/common';
import { DomainPersistence } from '@toxictoast/shared-application';
import { DATABASE_INJECT, provideClass, TOKENS } from '@toxictoast/shared-nest';
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
  PurgeExpiredChatMessagesUseCase,
  ListFollowsUseCase,
  ListClipsUseCase,
  ListVideosUseCase,
  MediaRecorder,
  StreamStatusRecorder,
  FollowerTotalRecorder,
} from '@toxictoast/twitch-application';
import { StreamSessionFactory } from '@toxictoast/twitch-domain';
import {
  RedisTwitchFeed,
  twitchChatConfigFromEnv,
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
  TypeOrmFollowRepository,
  TypeOrmClipRepository,
  TypeOrmVideoRepository,
} from '@toxictoast/twitch-infrastructure';
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
  CHAT_CONFIG,
  FOLLOW_REPOSITORY,
  CLIP_REPOSITORY,
  VIDEO_REPOSITORY,
} = TWITCH_SERVICE_TOKENS;

const { DOMAIN_CONTEXT, UNIT_OF_WORK, REDIS, REDIS_SUBSCRIBER, CLOCK } = TOKENS;
@Module({
  controllers: [TwitchGrpcController],
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: STATS_CONFIG,
      useFactory: () => twitchStatsConfigFromEnv(),
    },
    {
      provide: CHAT_CONFIG,
      useFactory: () => twitchChatConfigFromEnv(),
    },

    // ── Domain ──────────────────────────────────
    provideClass(StreamSessionFactory, [DOMAIN_CONTEXT]),

    // ── Infrastructure ──────────────────────────
    provideClass(
      TypeOrmStreamSessionRepository,
      DATABASE_INJECT,
      STREAM_SESSION_REPOSITORY,
    ),
    provideClass(
      TypeOrmChannelStatsRepository,
      DATABASE_INJECT,
      CHANNEL_STATS_REPOSITORY,
    ),
    provideClass(
      TypeOrmViewerStatsRepository,
      DATABASE_INJECT,
      VIEWER_STATS_REPOSITORY,
    ),
    provideClass(
      TypeOrmChatterActivityRepository,
      DATABASE_INJECT,
      CHATTER_ACTIVITY_REPOSITORY,
    ),
    provideClass(
      TypeOrmPresenceRepository,
      DATABASE_INJECT,
      PRESENCE_REPOSITORY,
    ),
    provideClass(
      TypeOrmRewardStatsRepository,
      DATABASE_INJECT,
      REWARD_STATS_REPOSITORY,
    ),
    provideClass(TypeOrmPollRepository, DATABASE_INJECT, POLL_REPOSITORY),
    provideClass(
      TypeOrmChatMessageRepository,
      DATABASE_INJECT,
      CHAT_MESSAGE_REPOSITORY,
    ),
    provideClass(TypeOrmFollowRepository, DATABASE_INJECT, FOLLOW_REPOSITORY),
    provideClass(TypeOrmClipRepository, DATABASE_INJECT, CLIP_REPOSITORY),
    provideClass(TypeOrmVideoRepository, DATABASE_INJECT, VIDEO_REPOSITORY),
    provideClass(
      TypeOrmChannelDirectoryRepository,
      DATABASE_INJECT,
      CHANNEL_DIRECTORY_REPOSITORY,
    ),
    provideClass(TypeOrmTwitchEventLog, DATABASE_INJECT, TWITCH_EVENT_LOG),
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
    provideClass(MediaRecorder, [CLIP_REPOSITORY, VIDEO_REPOSITORY]),
    provideClass(StreamStatusRecorder, [
      StreamSessionFactory,
      STREAM_SESSION_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(FollowerTotalRecorder, [
      CHANNEL_DIRECTORY_REPOSITORY,
      CHANNEL_STATS_REPOSITORY,
      STATS_CONFIG,
    ]),

    // ── Use Cases ───────────────────────────────
    provideClass(RecordTwitchEventUseCase, [
      TWITCH_EVENT_LOG,
      CHANNEL_DIRECTORY_REPOSITORY,
      StreamSessionFactory,
      STREAM_SESSION_REPOSITORY,
      DomainPersistence,
      POLL_REPOSITORY,
      FOLLOW_REPOSITORY,
      SessionTracker,
      PresenceTracker,
      CounterRecorder,
      ChatLogRecorder,
      MediaRecorder,
      StreamStatusRecorder,
      FollowerTotalRecorder,
      DispatchWebhookEventUseCase,
      LiveStatusReader,
      RedisTwitchFeed,
      UNIT_OF_WORK,
    ]),
    provideClass(ListFollowsUseCase, [FOLLOW_REPOSITORY]),
    provideClass(ListClipsUseCase, [CLIP_REPOSITORY]),
    provideClass(ListVideosUseCase, [
      VIDEO_REPOSITORY,
      STREAM_SESSION_REPOSITORY,
    ]),
    provideClass(ListChatMessagesUseCase, [CHAT_MESSAGE_REPOSITORY]),
    provideClass(PurgeExpiredChatMessagesUseCase, [
      CHAT_MESSAGE_REPOSITORY,
      CHAT_CONFIG,
      CLOCK,
    ]),
    provideClass(ListStatsChannelsUseCase, [
      CHANNEL_DIRECTORY_REPOSITORY,
      STREAM_SESSION_REPOSITORY,
      CHANNEL_STATS_REPOSITORY,
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
