import { randomUUID } from 'node:crypto';
import { status } from '@grpc/grpc-js';
import {
  CommentModerationService,
  CreateCommentUseCase,
  DeleteCommentUseCase,
  GetCommentUseCase,
  InMemoryCommentRepository,
  InMemoryPostRepository,
  ListCommentsByStatusUseCase,
  ListPostCommentsUseCase,
  ModerateCommentUseCase,
  postAnemic,
  RestoreCommentUseCase,
  UpdateCommentUseCase,
} from '@toxictoast/blog-application';
import { CommentFactory, PostStatus } from '@toxictoast/blog-domain';
import {
  BlogPermission,
  CommentModerator as GrpcCommentModerator,
  CommentStatus as GrpcCommentStatus,
  ModerationStatus as GrpcModerationStatus,
} from '@toxictoast/contracts-grpc';
import {
  createUuidTestContext,
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  anonymousTestActor,
  grpcCode,
  testActor,
  TestActorProvider,
} from '@toxictoast/shared-grpc';
import { CommentGrpcController } from './comment-grpc.controller.js';

const NOW = new Date('2026-10-20T12:00:00Z');
const POST = randomUUID();
const AUTHOR = randomUUID();
const MODERATOR = testActor(
  [
    BlogPermission.COMMENT_WRITE,
    BlogPermission.COMMENT_MODERATE,
    BlogPermission.COMMENT_DELETE,
  ],
  { id: AUTHOR },
);
const READER = testActor([BlogPermission.COMMENT_WRITE], { id: AUTHOR });

describe('CommentGrpcController', () => {
  let controller: CommentGrpcController;
  let actors: TestActorProvider;

  beforeEach(async () => {
    actors = new TestActorProvider(MODERATOR);
    const ctx = createUuidTestContext(NOW);
    const factory = new CommentFactory(ctx);
    const comments = new InMemoryCommentRepository();
    const posts = new InMemoryPostRepository();
    const moderation = new CommentModerationService();
    const persistence = new DomainPersistence(
      new InMemoryOutbox(),
      new ImmediateUnitOfWork(),
    );
    controller = new CommentGrpcController(
      new CreateCommentUseCase(factory, comments, posts, persistence),
      new UpdateCommentUseCase(factory, comments, persistence),
      new ModerateCommentUseCase(factory, comments, moderation, persistence),
      new DeleteCommentUseCase(factory, comments, persistence),
      new RestoreCommentUseCase(factory, comments, persistence),
      new GetCommentUseCase(comments),
      new ListPostCommentsUseCase(comments, posts),
      new ListCommentsByStatusUseCase(comments),
      actors,
    );

    await posts.save(postAnemic(POST, { status: PostStatus.PUBLISHED }));
  });

  const create = async (): Promise<string> => {
    const { comment } = await controller.createComment({
      post_id: POST,
      content: 'Für den Imperator!',
    });
    return comment?.id ?? '';
  };

  it('creates a pending comment without moderation data', async () => {
    const { comment } = await controller.createComment({
      post_id: POST,
      content: 'Für den Imperator!',
    });

    expect(comment).toMatchObject({
      post_id: POST,
      parent_id: undefined,
      status: GrpcCommentStatus.COMMENT_STATUS_PENDING,
      moderated_by: undefined,
      moderated_at: undefined,
    });
  });

  it('moderates a comment as admin', async () => {
    const id = await create();

    const { comment } = await controller.moderateComment({
      id,
      status: GrpcModerationStatus.MODERATION_STATUS_SPAM,
      note: 'link farm',
    });

    expect(comment).toMatchObject({
      status: GrpcCommentStatus.COMMENT_STATUS_SPAM,
      moderated_by: GrpcCommentModerator.COMMENT_MODERATOR_ADMIN,
      moderation_note: 'link farm',
      moderated_at: '2026-10-20T12:00:00.000Z',
    });
  });

  it('maps an unspecified moderation status to INVALID_ARGUMENT', async () => {
    const id = await create();

    const call = controller.moderateComment({
      id,
      status: GrpcModerationStatus.MODERATION_STATUS_UNSPECIFIED,
    });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('lists only approved comments of a post', async () => {
    const approved = await create();
    await create();
    await controller.moderateComment({
      id: approved,
      status: GrpcModerationStatus.MODERATION_STATUS_APPROVED,
    });

    const { comments } = await controller.listPostComments({ post_id: POST });

    expect(comments.map((comment) => comment.id)).toEqual([approved]);
  });

  it('lists the moderation queue', async () => {
    const pending = await create();

    const { comments } = await controller.listCommentsByStatus({
      status: GrpcCommentStatus.COMMENT_STATUS_PENDING,
    });

    expect(comments.map((comment) => comment.id)).toEqual([pending]);
  });

  it('maps an invalid post id to INVALID_ARGUMENT', async () => {
    const call = controller.createComment({
      post_id: 'abc',
      content: 'Hallo',
    });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('maps comments on an unknown post to NOT_FOUND', async () => {
    const call = controller.createComment({
      post_id: randomUUID(),
      content: 'Hallo',
    });

    expect(await grpcCode(call)).toBe(status.NOT_FOUND);
  });

  it('uses the signed-in user as author', async () => {
    const { comment } = await controller.createComment({
      post_id: POST,
      content: 'Für den Imperator!',
    });

    expect(comment?.author_id).toBe(AUTHOR);
  });

  it('rejects comments without a signed-in user', async () => {
    actors.actor = anonymousTestActor();

    const call = controller.createComment({
      post_id: POST,
      content: 'Für den Imperator!',
    });

    expect(await grpcCode(call)).toBe(status.UNAUTHENTICATED);
  });

  it('rejects comments without the write permission', async () => {
    actors.actor = testActor([], { id: AUTHOR });

    const call = controller.createComment({
      post_id: POST,
      content: 'Für den Imperator!',
    });

    expect(await grpcCode(call)).toBe(status.PERMISSION_DENIED);
  });

  it('lets the author edit and sends the comment back to moderation', async () => {
    const id = await create();
    await controller.moderateComment({
      id,
      status: GrpcModerationStatus.MODERATION_STATUS_APPROVED,
    });
    actors.actor = READER;

    const { comment } = await controller.updateComment({
      id,
      content: 'Geändert',
    });

    expect(comment).toMatchObject({
      content: 'Geändert',
      status: GrpcCommentStatus.COMMENT_STATUS_PENDING,
      moderated_by: undefined,
    });
  });

  it('rejects edits by other users', async () => {
    const id = await create();
    actors.actor = testActor([BlogPermission.COMMENT_WRITE], {
      id: randomUUID(),
    });

    const call = controller.updateComment({ id, content: 'Fremd' });

    expect(await grpcCode(call)).toBe(status.PERMISSION_DENIED);
  });

  it('keeps moderation and the queue behind the moderate permission', async () => {
    const id = await create();
    actors.actor = READER;

    const moderate = controller.moderateComment({
      id,
      status: GrpcModerationStatus.MODERATION_STATUS_APPROVED,
    });
    const queue = controller.listCommentsByStatus({
      status: GrpcCommentStatus.COMMENT_STATUS_PENDING,
    });

    expect(await grpcCode(moderate)).toBe(status.PERMISSION_DENIED);
    expect(await grpcCode(queue)).toBe(status.PERMISSION_DENIED);
  });

  it('lets only the delete permission delete comments', async () => {
    const id = await create();
    actors.actor = READER;

    expect(await grpcCode(controller.deleteComment({ id }))).toBe(
      status.PERMISSION_DENIED,
    );
  });

  it('hides unapproved comments from readers', async () => {
    const id = await create();
    actors.actor = anonymousTestActor();

    const call = controller.getComment({ id, with_deleted: false });

    expect(await grpcCode(call)).toBe(status.NOT_FOUND);
  });
});
