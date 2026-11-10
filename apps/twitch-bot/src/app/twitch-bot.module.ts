import { Logger, Module } from '@nestjs/common';
import { DomainPersistence } from '@toxictoast/shared-application';
import type { Clock } from '@toxictoast/shared-kernel';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { TransactionContext } from '@toxictoast/shared-persistence';
import {
  describeError,
  SecretCipher,
  secretKeyEnv,
} from '@toxictoast/shared-system';
import { TwitchBotGrpcController } from '@toxictoast/twitch-bot-api';
import {
  CompleteAuthorizationUseCase,
  DisconnectChannelUseCase,
  ListChannelsUseCase,
  PublishTwitchEventUseCase,
  ResumeSubscriptionsUseCase,
  RevokeChannelUseCase,
  StartAuthorizationUseCase,
  SyncChattersUseCase,
  SyncClipsUseCase,
  type TwitchTokenStore,
} from '@toxictoast/twitch-bot-application';
import {
  ChatterDiffService,
  TwitchChannelFactory,
  type TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import {
  requestAppToken,
  TwitchConnection,
  TwitchCredentialsCheck,
  twitchConfigFromEnv,
  TwitchSocketTracker,
  TwurpleChatterSource,
  TwurpleClipSource,
  TwurpleEventSubscriber,
  TwurpleTwitchAuthClient,
  TypeOrmChatterRepository,
  TypeOrmPublishedClipLedger,
  TypeOrmTwitchChannelRepository,
  TypeOrmTwitchTokenStore,
  type TwitchBotMetrics,
  type TwitchConfig,
} from '@toxictoast/twitch-bot-infrastructure';
import { DataSource } from 'typeorm';
import { TWITCH_BOT_TOKENS } from './constants/index.js';
import { TwitchSubscriptionLifecycle } from './lifecycles/index.js';
import { PrometheusTwitchBotMetrics } from './metrics/index.js';
import { TwitchReadinessProbe } from './probes/index.js';

const { TWITCH_CONFIG, TOKEN_CIPHER } = TWITCH_BOT_TOKENS;
const { TWITCH_CHANNEL_REPOSITORY, CHATTER_REPOSITORY } = TWITCH_BOT_TOKENS;
const { TWITCH_TOKEN_STORE, PUBLISHED_CLIP_LEDGER } = TWITCH_BOT_TOKENS;
const { TWITCH_AUTH_CLIENT, TWITCH_CHATTER_SOURCE } = TWITCH_BOT_TOKENS;
const { TWITCH_CLIP_SOURCE, TWITCH_EVENT_SUBSCRIBER } = TWITCH_BOT_TOKENS;
const { TWITCH_BOT_METRICS } = TWITCH_BOT_TOKENS;
const { CLOCK, DOMAIN_CONTEXT, OUTBOX, UNIT_OF_WORK } = TOKENS;
const { METRICS_REGISTRY } = TOKENS;
const DATABASE = [DataSource, TransactionContext];

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
      useFactory: () => new SecretCipher(secretKeyEnv('TWITCH_TOKEN_KEY')),
    },

    // ── Domain ──────────────────────────────────
    provideClass(TwitchChannelFactory, [DOMAIN_CONTEXT]),
    provideClass(ChatterDiffService),

    // ── Infrastructure ──────────────────────────
    provideClass(
      TypeOrmTwitchChannelRepository,
      DATABASE,
      TWITCH_CHANNEL_REPOSITORY,
    ),
    provideClass(TypeOrmChatterRepository, DATABASE, CHATTER_REPOSITORY),
    provideClass(
      TypeOrmTwitchTokenStore,
      [...DATABASE, TOKEN_CIPHER, CLOCK],
      TWITCH_TOKEN_STORE,
    ),
    provideClass(
      TypeOrmPublishedClipLedger,
      [...DATABASE, CLOCK],
      PUBLISHED_CLIP_LEDGER,
    ),
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
        tokens: TwitchTokenStore,
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
    provideClass(
      TwurpleChatterSource,
      [TwitchConnection],
      TWITCH_CHATTER_SOURCE,
    ),
    provideClass(TwurpleClipSource, [TwitchConnection], TWITCH_CLIP_SOURCE),
    {
      provide: TWITCH_EVENT_SUBSCRIBER,
      inject: [
        TwitchConnection,
        PublishTwitchEventUseCase,
        TwitchSocketTracker,
        TWITCH_BOT_METRICS,
      ],
      useFactory: (
        connection: TwitchConnection,
        publisher: PublishTwitchEventUseCase,
        sockets: TwitchSocketTracker,
        metrics: TwitchBotMetrics,
      ) => {
        return new TwurpleEventSubscriber(
          connection,
          publisher,
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

    // ── Use Cases ───────────────────────────────
    provideClass(PublishTwitchEventUseCase, [
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),
    provideClass(StartAuthorizationUseCase, [TWITCH_AUTH_CLIENT]),
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
      TWITCH_CHANNEL_REPOSITORY,
      TWITCH_CLIP_SOURCE,
      PUBLISHED_CLIP_LEDGER,
      OUTBOX,
      UNIT_OF_WORK,
      DOMAIN_CONTEXT,
    ]),

    // ── Lifecycles ──────────────────────────────
    TwitchSubscriptionLifecycle,
  ],
  exports: [TwitchReadinessProbe],
})
export class TwitchBotModule {}
