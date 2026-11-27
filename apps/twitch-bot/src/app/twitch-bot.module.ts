import { Logger, Module } from '@nestjs/common';
import { DomainPersistence } from '@toxictoast/shared-application';
import type { Clock } from '@toxictoast/shared-kernel';
import {
  provideClass,
  provideSecretRotation,
  TOKENS,
  DATABASE_INJECT,
} from '@toxictoast/shared-nest';
import {
  describeError,
  SecretCipher,
  secretKeyringEnv,
} from '@toxictoast/shared-system';
import { TwitchBotGrpcController } from '@toxictoast/twitch-bot-api';
import {
  AddFriendUseCase,
  CompleteAuthorizationUseCase,
  DisconnectChannelUseCase,
  ListChannelsUseCase,
  ListFriendsUseCase,
  PublishTwitchEventUseCase,
  RemoveFriendUseCase,
  ResumeSubscriptionsUseCase,
  RevokeChannelUseCase,
  SyncChattersUseCase,
  SyncClipsUseCase,
  SyncFollowersUseCase,
  ImportMediaUseCase,
  RefreshArchiveUseCase,
  SyncMediaUseCase,
  SyncVideosUseCase,
  TrackedChannels,
  SyncStreamsUseCase,
  SyncFollowerCountsUseCase,
  TWITCH_BOT_SCOPES,
  type TwitchAuthClient,
} from '@toxictoast/twitch-bot-application';
import {
  ChatterDiffService,
  TwitchChannelFactory,
  TwitchFriendFactory,
  type TwitchChannelRepository,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import {
  requestAppToken,
  TwitchConnection,
  TwitchCredentialsCheck,
  twitchConfigFromEnv,
  TwitchSocketTracker,
  TwurpleChatterSource,
  TwurpleClipSource,
  TwurpleFollowerSource,
  TwurpleEventSubscriber,
  TwurpleTwitchAuthClient,
  TwurpleUserLookup,
  TypeOrmChatterRepository,
  TypeOrmFollowerRepository,
  TypeOrmPublishedClipLedger,
  TypeOrmTwitchChannelRepository,
  TypeOrmTwitchFriendRepository,
  type TwitchBotMetrics,
  type TwitchConfig,
  TwitchTokenSchema,
  TwurpleVideoSource,
  TypeOrmMediaImportLog,
  TypeOrmPublishedVideoLedger,
  TwurpleStreamSource,
  TypeOrmLiveStreamLedger,
} from '@toxictoast/twitch-bot-infrastructure';
import { TWITCH_BOT_ENV, TWITCH_BOT_TOKENS } from './constants/index.js';
import { TwitchSubscriptionLifecycle } from './lifecycles/index.js';
import { PrometheusTwitchBotMetrics } from './metrics/index.js';
import { TwitchReadinessProbe } from './probes/index.js';
import {
  type OAuthTokenStore,
  StartOAuthUseCase,
} from '@toxictoast/shared-application';
import {
  TransactionContext,
  TypeOrmOAuthTokenStore,
} from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';

const {
  TWITCH_CONFIG,
  TOKEN_CIPHER,
  TWITCH_CHANNEL_REPOSITORY,
  TWITCH_FRIEND_REPOSITORY,
  CHATTER_REPOSITORY,
  TWITCH_TOKEN_STORE,
  PUBLISHED_CLIP_LEDGER,
  TWITCH_AUTH_CLIENT,
  TWITCH_USER_LOOKUP,
  TWITCH_CHATTER_SOURCE,
  TWITCH_CLIP_SOURCE,
  TWITCH_EVENT_SUBSCRIBER,
  TWITCH_BOT_METRICS,
  FOLLOWER_REPOSITORY,
  TWITCH_FOLLOWER_SOURCE,
  PUBLISHED_VIDEO_LEDGER,
  MEDIA_IMPORT_LOG,
  TWITCH_VIDEO_SOURCE,
  LIVE_STREAM_LEDGER,
  TWITCH_STREAM_SOURCE,
} = TWITCH_BOT_TOKENS;
const { CLOCK, DOMAIN_CONTEXT, OUTBOX, UNIT_OF_WORK, METRICS_REGISTRY } =
  TOKENS;
const logger = new Logger('Twitch');
const logError = (error: unknown, context: string): void => {
  logger.error(context, describeError(error));
};

@Module({
  controllers: [TwitchBotGrpcController],
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: TWITCH_CONFIG,
      useFactory: () => twitchConfigFromEnv(),
    },
    {
      provide: TOKEN_CIPHER,
      useFactory: () =>
        new SecretCipher(secretKeyringEnv(TWITCH_BOT_ENV.TOKEN_KEYRING_PREFIX)),
    },
    provideSecretRotation(TOKEN_CIPHER, TwitchTokenSchema, [
      'access_token',
      'refresh_token',
    ]),

    // ── Domain ──────────────────────────────────
    provideClass(TwitchChannelFactory, [DOMAIN_CONTEXT]),
    provideClass(TwitchFriendFactory, [DOMAIN_CONTEXT]),
    provideClass(ChatterDiffService),

    // ── Infrastructure ──────────────────────────
    provideClass(
      TypeOrmTwitchChannelRepository,
      DATABASE_INJECT,
      TWITCH_CHANNEL_REPOSITORY,
    ),
    provideClass(
      TypeOrmTwitchFriendRepository,
      DATABASE_INJECT,
      TWITCH_FRIEND_REPOSITORY,
    ),
    provideClass(TypeOrmChatterRepository, DATABASE_INJECT, CHATTER_REPOSITORY),
    provideClass(
      TypeOrmFollowerRepository,
      DATABASE_INJECT,
      FOLLOWER_REPOSITORY,
    ),
    {
      provide: TWITCH_TOKEN_STORE,
      inject: [...DATABASE_INJECT, TOKEN_CIPHER, CLOCK],
      useFactory: (
        dataSource: DataSource,
        context: TransactionContext,
        cipher: SecretCipher,
        clock: Clock,
      ) => {
        return new TypeOrmOAuthTokenStore<TwitchChannelId>(
          dataSource,
          context,
          cipher,
          clock,
          TwitchTokenSchema,
        );
      },
    },
    provideClass(
      TypeOrmPublishedClipLedger,
      [...DATABASE_INJECT, CLOCK],
      PUBLISHED_CLIP_LEDGER,
    ),
    provideClass(
      TypeOrmPublishedVideoLedger,
      [...DATABASE_INJECT, CLOCK],
      PUBLISHED_VIDEO_LEDGER,
    ),
    provideClass(TypeOrmMediaImportLog, DATABASE_INJECT, MEDIA_IMPORT_LOG),
    provideClass(TypeOrmLiveStreamLedger, DATABASE_INJECT, LIVE_STREAM_LEDGER),
    provideClass(TwitchSocketTracker, [CLOCK]),
    provideClass(
      PrometheusTwitchBotMetrics,
      [METRICS_REGISTRY, TwitchSocketTracker],
      TWITCH_BOT_METRICS,
    ),
    {
      provide: TwitchCredentialsCheck,
      inject: [TWITCH_CONFIG, CLOCK],
      useFactory: (config: TwitchConfig, clock: Clock) => {
        return new TwitchCredentialsCheck(() => requestAppToken(config), clock);
      },
    },
    {
      provide: TwitchConnection,
      inject: [
        TWITCH_CONFIG,
        TWITCH_CHANNEL_REPOSITORY,
        TWITCH_TOKEN_STORE,
        TWITCH_BOT_METRICS,
      ],
      useFactory: (
        config: TwitchConfig,
        channels: TwitchChannelRepository,
        tokens: OAuthTokenStore,
        metrics: TwitchBotMetrics,
      ) => {
        return new TwitchConnection(
          config,
          channels,
          tokens,
          metrics,
          logError,
        );
      },
    },
    provideClass(TwurpleTwitchAuthClient, [TWITCH_CONFIG], TWITCH_AUTH_CLIENT),
    provideClass(TwurpleUserLookup, [TwitchConnection], TWITCH_USER_LOOKUP),
    provideClass(
      TwurpleChatterSource,
      [TwitchConnection],
      TWITCH_CHATTER_SOURCE,
    ),
    provideClass(TwurpleClipSource, [TwitchConnection], TWITCH_CLIP_SOURCE),
    provideClass(TwurpleVideoSource, [TwitchConnection], TWITCH_VIDEO_SOURCE),
    provideClass(TwurpleStreamSource, [TwitchConnection], TWITCH_STREAM_SOURCE),
    provideClass(
      TwurpleFollowerSource,
      [TwitchConnection],
      TWITCH_FOLLOWER_SOURCE,
    ),
    {
      provide: TWITCH_EVENT_SUBSCRIBER,
      inject: [
        TwitchConnection,
        PublishTwitchEventUseCase,
        RefreshArchiveUseCase,
        TwitchSocketTracker,
        TWITCH_BOT_METRICS,
      ],
      useFactory: (
        connection: TwitchConnection,
        publisher: PublishTwitchEventUseCase,
        archives: RefreshArchiveUseCase,
        sockets: TwitchSocketTracker,
        metrics: TwitchBotMetrics,
      ) => {
        return new TwurpleEventSubscriber(
          connection,
          publisher,
          archives,
          sockets,
          metrics,
          logError,
        );
      },
    },
    provideClass(TwitchReadinessProbe, [
      TwitchCredentialsCheck,
      TwitchSocketTracker,
      CLOCK,
    ]),

    // ── Application Services ────────────────────
    provideClass(TrackedChannels, [
      TWITCH_CHANNEL_REPOSITORY,
      TWITCH_FRIEND_REPOSITORY,
    ]),

    // ── Use Cases ───────────────────────────────
    provideClass(PublishTwitchEventUseCase, [
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    {
      provide: StartOAuthUseCase,
      inject: [TWITCH_AUTH_CLIENT],
      useFactory: (auth: TwitchAuthClient) => {
        return new StartOAuthUseCase(auth, TWITCH_BOT_SCOPES);
      },
    },
    provideClass(CompleteAuthorizationUseCase, [
      TwitchChannelFactory,
      TWITCH_CHANNEL_REPOSITORY,
      DomainPersistence,
      TWITCH_AUTH_CLIENT,
      TWITCH_TOKEN_STORE,
      TWITCH_EVENT_SUBSCRIBER,
    ]),
    provideClass(ListChannelsUseCase, [TWITCH_CHANNEL_REPOSITORY]),
    provideClass(DisconnectChannelUseCase, [
      TwitchChannelFactory,
      TWITCH_CHANNEL_REPOSITORY,
      DomainPersistence,
      TWITCH_TOKEN_STORE,
      TWITCH_EVENT_SUBSCRIBER,
    ]),
    provideClass(RevokeChannelUseCase, [
      TwitchChannelFactory,
      TWITCH_CHANNEL_REPOSITORY,
      DomainPersistence,
      TWITCH_TOKEN_STORE,
      TWITCH_EVENT_SUBSCRIBER,
    ]),
    provideClass(ResumeSubscriptionsUseCase, [
      TWITCH_CHANNEL_REPOSITORY,
      TWITCH_EVENT_SUBSCRIBER,
    ]),
    provideClass(SyncChattersUseCase, [
      TWITCH_CHANNEL_REPOSITORY,
      CHATTER_REPOSITORY,
      TWITCH_CHATTER_SOURCE,
      ChatterDiffService,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(SyncClipsUseCase, [
      TrackedChannels,
      TWITCH_CLIP_SOURCE,
      PUBLISHED_CLIP_LEDGER,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(SyncVideosUseCase, [
      TrackedChannels,
      TWITCH_VIDEO_SOURCE,
      PUBLISHED_VIDEO_LEDGER,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(ImportMediaUseCase, [
      TrackedChannels,
      TWITCH_CLIP_SOURCE,
      TWITCH_VIDEO_SOURCE,
      PUBLISHED_CLIP_LEDGER,
      PUBLISHED_VIDEO_LEDGER,
      MEDIA_IMPORT_LOG,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(SyncMediaUseCase, [
      ImportMediaUseCase,
      SyncClipsUseCase,
      SyncVideosUseCase,
    ]),
    provideClass(RefreshArchiveUseCase, [
      TWITCH_VIDEO_SOURCE,
      PUBLISHED_VIDEO_LEDGER,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(SyncStreamsUseCase, [
      TrackedChannels,
      TWITCH_STREAM_SOURCE,
      LIVE_STREAM_LEDGER,
      RefreshArchiveUseCase,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(SyncFollowersUseCase, [
      TWITCH_CHANNEL_REPOSITORY,
      FOLLOWER_REPOSITORY,
      TWITCH_FOLLOWER_SOURCE,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(SyncFollowerCountsUseCase, [
      TWITCH_CHANNEL_REPOSITORY,
      TrackedChannels,
      TWITCH_FOLLOWER_SOURCE,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(ListFriendsUseCase, [TWITCH_FRIEND_REPOSITORY]),
    provideClass(AddFriendUseCase, [
      TwitchFriendFactory,
      TWITCH_FRIEND_REPOSITORY,
      TWITCH_CHANNEL_REPOSITORY,
      DomainPersistence,
      TWITCH_USER_LOOKUP,
    ]),
    provideClass(RemoveFriendUseCase, [
      TwitchFriendFactory,
      TWITCH_FRIEND_REPOSITORY,
      DomainPersistence,
    ]),

    // ── Lifecycles ──────────────────────────────
    TwitchSubscriptionLifecycle,
  ],
  exports: [TwitchReadinessProbe],
})
export class TwitchBotModule {}
