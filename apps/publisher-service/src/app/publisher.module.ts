import { Module } from '@nestjs/common';
import {
  SocialAccountHandler,
  SocialPostGrpcController,
  SocialPostHandler,
} from '@toxictoast/publisher-api';
import {
  ListDuePostsUseCase,
  RecordAccountUseCase,
  RecordPostFailureUseCase,
  RecordPostUseCase,
} from '@toxictoast/publisher-application';
import {
  TypeOrmAccountRepository,
  TypeOrmAccountSnapshotRepository,
  TypeOrmPostCheckRepository,
  TypeOrmPostRepository,
  TypeOrmPostSnapshotRepository,
} from '@toxictoast/publisher-infrastructure';
import { DATABASE_INJECT, provideClass, TOKENS } from '@toxictoast/shared-nest';
import { PUBLISHER_TOKENS } from './constants/index.js';

const {
  ACCOUNT_REPOSITORY,
  ACCOUNT_SNAPSHOT_REPOSITORY,
  POST_REPOSITORY,
  POST_SNAPSHOT_REPOSITORY,
  POST_CHECK_REPOSITORY,
} = PUBLISHER_TOKENS;
const { DOMAIN_CONTEXT, UNIT_OF_WORK } = TOKENS;

@Module({
  controllers: [SocialPostGrpcController],
  providers: [
    // ── Repositories ────────────────────────────
    provideClass(TypeOrmAccountRepository, DATABASE_INJECT, ACCOUNT_REPOSITORY),
    provideClass(
      TypeOrmAccountSnapshotRepository,
      DATABASE_INJECT,
      ACCOUNT_SNAPSHOT_REPOSITORY,
    ),
    provideClass(TypeOrmPostRepository, DATABASE_INJECT, POST_REPOSITORY),
    provideClass(
      TypeOrmPostSnapshotRepository,
      DATABASE_INJECT,
      POST_SNAPSHOT_REPOSITORY,
    ),
    provideClass(
      TypeOrmPostCheckRepository,
      DATABASE_INJECT,
      POST_CHECK_REPOSITORY,
    ),

    // ── Reporting ───────────────────────────────
    provideClass(RecordAccountUseCase, [
      ACCOUNT_REPOSITORY,
      ACCOUNT_SNAPSHOT_REPOSITORY,
      UNIT_OF_WORK,
    ]),
    provideClass(RecordPostUseCase, [
      POST_REPOSITORY,
      POST_SNAPSHOT_REPOSITORY,
      POST_CHECK_REPOSITORY,
      UNIT_OF_WORK,
    ]),
    provideClass(RecordPostFailureUseCase, [POST_CHECK_REPOSITORY]),
    provideClass(ListDuePostsUseCase, [POST_CHECK_REPOSITORY, DOMAIN_CONTEXT]),

    // ── Consumers ───────────────────────────────
    SocialAccountHandler,
    SocialPostHandler,
  ],
  exports: [SocialAccountHandler, SocialPostHandler],
})
export class PublisherModule {}
