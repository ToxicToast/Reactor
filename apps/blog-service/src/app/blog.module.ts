import { Module } from '@nestjs/common';
import {
  CategoryGrpcController,
  CommentGrpcController,
  MediaGrpcController,
  ModerationDecidedHandler,
  PostGrpcController,
  TagGrpcController,
} from '@toxictoast/blog-api';
import {
  ApplyModerationDecisionUseCase,
  ArchivePostUseCase,
  CategoryHierarchyService,
  ChangeCategoryParentUseCase,
  CommentModerationService,
  ConfirmMediaUploadUseCase,
  CreateCategoryUseCase,
  CreateCommentUseCase,
  CreatePostUseCase,
  CreateTagUseCase,
  DeleteCategoryUseCase,
  DeleteCommentUseCase,
  DeleteMediaUseCase,
  DeletePostUseCase,
  DeleteTagUseCase,
  GetCategoryUseCase,
  GetCommentUseCase,
  GetMediaUrlUseCase,
  GetMediaUseCase,
  GetPostUseCase,
  GetPublishedPostUseCase,
  GetTagUseCase,
  ListCategoriesUseCase,
  ListCommentsByStatusUseCase,
  ListMediaUseCase,
  ListPostCommentsUseCase,
  ListPostsUseCase,
  ListTagsUseCase,
  ModerateCommentUseCase,
  PostReferencesService,
  PublishPostUseCase,
  RequestMediaUploadUseCase,
  RestoreCategoryUseCase,
  RestoreCommentUseCase,
  RestoreMediaUseCase,
  RestorePostUseCase,
  RestoreTagUseCase,
  UnarchivePostUseCase,
  UpdateCategoryUseCase,
  UpdateCommentUseCase,
  UpdateMediaAltTextUseCase,
  UpdatePostUseCase,
  UpdateTagUseCase,
} from '@toxictoast/blog-application';
import {
  CategoryFactory,
  CommentFactory,
  MediaFactory,
  PostFactory,
  TagFactory,
} from '@toxictoast/blog-domain';
import {
  TypeOrmCategoryRepository,
  TypeOrmCommentRepository,
  TypeOrmMediaRepository,
  TypeOrmPostRepository,
  TypeOrmTagRepository,
} from '@toxictoast/blog-infrastructure';
import { DomainPersistence } from '@toxictoast/shared-application';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { TransactionContext } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { BLOG_TOKENS } from './constants/index.js';

const { TAG_REPOSITORY, CATEGORY_REPOSITORY, MEDIA_REPOSITORY } = BLOG_TOKENS;
const { POST_REPOSITORY, COMMENT_REPOSITORY } = BLOG_TOKENS;
const { DOMAIN_CONTEXT, FILE_STORAGE } = TOKENS;
const DATABASE = [DataSource, TransactionContext];

@Module({
  controllers: [
    TagGrpcController,
    CategoryGrpcController,
    MediaGrpcController,
    PostGrpcController,
    CommentGrpcController,
  ],
  providers: [
    // ── Factories ───────────────────────────────
    provideClass(TagFactory, [DOMAIN_CONTEXT]),
    provideClass(CategoryFactory, [DOMAIN_CONTEXT]),
    provideClass(MediaFactory, [DOMAIN_CONTEXT]),
    provideClass(PostFactory, [DOMAIN_CONTEXT]),
    provideClass(CommentFactory, [DOMAIN_CONTEXT]),

    // ── Repositories ────────────────────────────
    provideClass(TypeOrmTagRepository, DATABASE, TAG_REPOSITORY),
    provideClass(TypeOrmCategoryRepository, DATABASE, CATEGORY_REPOSITORY),
    provideClass(TypeOrmMediaRepository, DATABASE, MEDIA_REPOSITORY),
    provideClass(TypeOrmPostRepository, DATABASE, POST_REPOSITORY),
    provideClass(TypeOrmCommentRepository, DATABASE, COMMENT_REPOSITORY),

    // ── Services ────────────────────────────────
    provideClass(CategoryHierarchyService, [CATEGORY_REPOSITORY]),
    provideClass(PostReferencesService, [
      CATEGORY_REPOSITORY,
      TAG_REPOSITORY,
      MEDIA_REPOSITORY,
    ]),
    provideClass(CommentModerationService),

    // ── Tag ─────────────────────────────────────
    provideClass(CreateTagUseCase, [
      TagFactory,
      TAG_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(UpdateTagUseCase, [
      TagFactory,
      TAG_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(DeleteTagUseCase, [
      TagFactory,
      TAG_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(RestoreTagUseCase, [
      TagFactory,
      TAG_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(GetTagUseCase, [TAG_REPOSITORY]),
    provideClass(ListTagsUseCase, [TAG_REPOSITORY]),

    // ── Category ────────────────────────────────
    provideClass(CreateCategoryUseCase, [
      CategoryFactory,
      CATEGORY_REPOSITORY,
      CategoryHierarchyService,
      DomainPersistence,
    ]),
    provideClass(UpdateCategoryUseCase, [
      CategoryFactory,
      CATEGORY_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(ChangeCategoryParentUseCase, [
      CategoryFactory,
      CATEGORY_REPOSITORY,
      CategoryHierarchyService,
      DomainPersistence,
    ]),
    provideClass(DeleteCategoryUseCase, [
      CategoryFactory,
      CATEGORY_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(RestoreCategoryUseCase, [
      CategoryFactory,
      CATEGORY_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(GetCategoryUseCase, [CATEGORY_REPOSITORY]),
    provideClass(ListCategoriesUseCase, [CATEGORY_REPOSITORY]),

    // ── Media ───────────────────────────────────
    provideClass(RequestMediaUploadUseCase, [
      MediaFactory,
      MEDIA_REPOSITORY,
      FILE_STORAGE,
      DomainPersistence,
    ]),
    provideClass(ConfirmMediaUploadUseCase, [
      MediaFactory,
      MEDIA_REPOSITORY,
      FILE_STORAGE,
      DomainPersistence,
    ]),
    provideClass(UpdateMediaAltTextUseCase, [
      MediaFactory,
      MEDIA_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(DeleteMediaUseCase, [
      MediaFactory,
      MEDIA_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(RestoreMediaUseCase, [
      MediaFactory,
      MEDIA_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(GetMediaUseCase, [MEDIA_REPOSITORY]),
    provideClass(GetMediaUrlUseCase, [MEDIA_REPOSITORY, FILE_STORAGE]),
    provideClass(ListMediaUseCase, [MEDIA_REPOSITORY]),

    // ── Post ────────────────────────────────────
    provideClass(CreatePostUseCase, [
      PostFactory,
      POST_REPOSITORY,
      PostReferencesService,
      DomainPersistence,
    ]),
    provideClass(UpdatePostUseCase, [
      PostFactory,
      POST_REPOSITORY,
      PostReferencesService,
      DomainPersistence,
    ]),
    provideClass(PublishPostUseCase, [
      PostFactory,
      POST_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(ArchivePostUseCase, [
      PostFactory,
      POST_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(UnarchivePostUseCase, [
      PostFactory,
      POST_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(DeletePostUseCase, [
      PostFactory,
      POST_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(RestorePostUseCase, [
      PostFactory,
      POST_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(GetPostUseCase, [POST_REPOSITORY]),
    provideClass(GetPublishedPostUseCase, [POST_REPOSITORY]),
    provideClass(ListPostsUseCase, [POST_REPOSITORY]),

    // ── Comment ─────────────────────────────────
    provideClass(CreateCommentUseCase, [
      CommentFactory,
      COMMENT_REPOSITORY,
      POST_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(UpdateCommentUseCase, [
      CommentFactory,
      COMMENT_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(ModerateCommentUseCase, [
      CommentFactory,
      COMMENT_REPOSITORY,
      CommentModerationService,
      DomainPersistence,
    ]),
    provideClass(ApplyModerationDecisionUseCase, [
      CommentFactory,
      COMMENT_REPOSITORY,
      CommentModerationService,
      DomainPersistence,
    ]),
    provideClass(DeleteCommentUseCase, [
      CommentFactory,
      COMMENT_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(RestoreCommentUseCase, [
      CommentFactory,
      COMMENT_REPOSITORY,
      DomainPersistence,
    ]),
    provideClass(GetCommentUseCase, [COMMENT_REPOSITORY]),
    provideClass(ListPostCommentsUseCase, [
      COMMENT_REPOSITORY,
      POST_REPOSITORY,
    ]),
    provideClass(ListCommentsByStatusUseCase, [COMMENT_REPOSITORY]),

    // ── Consumers ───────────────────────────────
    ModerationDecidedHandler,
  ],
  exports: [ModerationDecidedHandler],
})
export class BlogModule {}
