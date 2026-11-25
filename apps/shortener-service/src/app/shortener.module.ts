import { Module } from '@nestjs/common';
import { DomainPersistence } from '@toxictoast/shared-application';
import { DATABASE_INJECT, provideClass, TOKENS } from '@toxictoast/shared-nest';
import {
  LinkClickHandler,
  LinkGrpcController,
} from '@toxictoast/shortener-api';
import {
  CreateLinkUseCase,
  DeleteLinkUseCase,
  GetLinkStatsUseCase,
  GetLinkUseCase,
  ListLinksUseCase,
  RecordClickUseCase,
  ResolveLinkUseCase,
  RestoreLinkUseCase,
  UpdateLinkUseCase,
} from '@toxictoast/shortener-application';
import { LinkFactory } from '@toxictoast/shortener-domain';
import {
  shortenerStatsConfigFromEnv,
  TypeOrmLinkClickRepository,
  TypeOrmLinkRepository,
} from '@toxictoast/shortener-infrastructure';
import { SHORTENER_TOKENS } from './constants/index.js';

const { LINK_REPOSITORY, LINK_CLICK_REPOSITORY, STATS_CONFIG } =
  SHORTENER_TOKENS;
const { DOMAIN_CONTEXT } = TOKENS;

@Module({
  controllers: [LinkGrpcController],
  providers: [
    // ── Config ──────────────────────────────────
    {
      provide: STATS_CONFIG,
      useFactory: () => shortenerStatsConfigFromEnv(),
    },

    // ── Factories ───────────────────────────────
    provideClass(LinkFactory, [DOMAIN_CONTEXT]),

    // ── Repositories ────────────────────────────
    provideClass(TypeOrmLinkRepository, DATABASE_INJECT, LINK_REPOSITORY),
    provideClass(
      TypeOrmLinkClickRepository,
      DATABASE_INJECT,
      LINK_CLICK_REPOSITORY,
    ),

    // ── Link ────────────────────────────────────
    provideClass(CreateLinkUseCase, [
      LinkFactory,
      LINK_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(UpdateLinkUseCase, [
      LinkFactory,
      LINK_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(DeleteLinkUseCase, [
      LinkFactory,
      LINK_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(RestoreLinkUseCase, [
      LinkFactory,
      LINK_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(GetLinkUseCase, [LINK_REPOSITORY]),
    provideClass(ListLinksUseCase, [LINK_REPOSITORY]),
    provideClass(ResolveLinkUseCase, [LinkFactory, LINK_REPOSITORY]),

    // ── Clicks ──────────────────────────────────
    provideClass(RecordClickUseCase, [LINK_CLICK_REPOSITORY]),
    provideClass(GetLinkStatsUseCase, [
      LINK_REPOSITORY,
      LINK_CLICK_REPOSITORY,
      STATS_CONFIG,
      DOMAIN_CONTEXT,
    ]),

    // ── Consumers ───────────────────────────────
    LinkClickHandler,
  ],
  exports: [LinkClickHandler],
})
export class ShortenerModule {}
