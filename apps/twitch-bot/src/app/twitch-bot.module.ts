import { Logger, Module } from '@nestjs/common';
import { DomainPersistence } from '@toxictoast/shared-application';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { TransactionContext } from '@toxictoast/shared-persistence';
import { describeError } from '@toxictoast/shared-system';
import { TwitchBotGrpcController } from '@toxictoast/twitch-bot-api';
import {
  CompleteAuthorizationUseCase,
  DisconnectChannelUseCase,
  ListChannelsUseCase,
  PublishTwitchEventUseCase,
  ResumeSubscriptionsUseCase,
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
  TokenCipher,
  tokenCipherKeyFromEnv,
  TwitchConnection,
  twitchConfigFromEnv,
  TwurpleChatterSource,
  TwurpleClipSource,
  TwurpleEventSubscriber,
  TwurpleTwitchAuthClient,
  TypeOrmChatterRepository,
  TypeOrmPublishedClipLedger,
  TypeOrmTwitchChannelRepository,
  TypeOrmTwitchTokenStore,
  type TwitchConfig,
} from '@toxictoast/twitch-bot-infrastructure';
import { DataSource } from 'typeorm';
import { TWITCH_BOT_TOKENS } from './constants/index.js';
import { TwitchSubscriptionLifecycle } from './lifecycles/index.js';

const { TWITCH_CONFIG, TOKEN_CIPHER } = TWITCH_BOT_TOKENS;
const { TWITCH_CHANNEL_REPOSITORY, CHATTER_REPOSITORY } = TWITCH_BOT_TOKENS;
const { TWITCH_TOKEN_STORE, PUBLISHED_CLIP_LEDGER } = TWITCH_BOT_TOKENS;
const { TWITCH_AUTH_CLIENT, TWITCH_CHATTER_SOURCE } = TWITCH_BOT_TOKENS;
const { TWITCH_CLIP_SOURCE, TWITCH_EVENT_SUBSCRIBER } = TWITCH_BOT_TOKENS;
const { CLOCK, DOMAIN_CONTEXT, OUTBOX, UNIT_OF_WORK } = TOKENS;
const DATABASE = [DataSource, TransactionContext];

const logger = new Logger('Twitch');

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
      useFactory: () => new TokenCipher(tokenCipherKeyFromEnv()),
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
    {
      provide: TwitchConnection,
      inject: [TWITCH_CONFIG, TWITCH_CHANNEL_REPOSITORY, TWITCH_TOKEN_STORE],
      useFactory: (
        config: TwitchConfig,
        channels: TwitchChannelRepository,
        tokens: TwitchTokenStore,
      ) => {
        return new TwitchConnection(config, channels, tokens, (error) => {
          logger.error(
            'Storing a refreshed Twitch token failed',
            describeError(error),
          );
        });
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
      inject: [TwitchConnection, PublishTwitchEventUseCase],
      useFactory: (
        connection: TwitchConnection,
        publisher: PublishTwitchEventUseCase,
      ) => {
        return new TwurpleEventSubscriber(
          connection,
          publisher,
          (error, context) => {
            logger.error(context, describeError(error));
          },
        );
      },
    },

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
})
export class TwitchBotModule {}
