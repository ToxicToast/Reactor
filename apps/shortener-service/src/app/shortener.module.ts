import { Module } from '@nestjs/common';
import { DomainPersistence } from '@toxictoast/shared-application';
import { DATABASE_INJECT, provideClass, TOKENS } from '@toxictoast/shared-nest';
import { LinkGrpcController } from '@toxictoast/shortener-api';
import {
  CreateLinkUseCase,
  DeleteLinkUseCase,
  GetLinkUseCase,
  ListLinksUseCase,
  ResolveLinkUseCase,
  RestoreLinkUseCase,
  UpdateLinkUseCase,
} from '@toxictoast/shortener-application';
import { LinkFactory } from '@toxictoast/shortener-domain';
import { TypeOrmLinkRepository } from '@toxictoast/shortener-infrastructure';
import { SHORTENER_TOKENS } from './constants/index.js';

const { LINK_REPOSITORY } = SHORTENER_TOKENS;
const { DOMAIN_CONTEXT } = TOKENS;

@Module({
  controllers: [LinkGrpcController],
  providers: [
    // ── Factories ───────────────────────────────
    provideClass(LinkFactory, [DOMAIN_CONTEXT]),

    // ── Repositories ────────────────────────────
    provideClass(TypeOrmLinkRepository, DATABASE_INJECT, LINK_REPOSITORY),

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
  ],
})
export class ShortenerModule {}
