import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  CommentFactory,
  CommentStatus,
  PostStatus,
  type AuthorId,
  type CommentData,
  type CommentId,
  type PostId,
} from '@toxictoast/blog-domain';
import {
  commentAnemic,
  createTestContext,
  InMemoryCommentRepository,
  InMemoryPostRepository,
  postAnemic,
  TEST_NOW,
} from '../../testing/index.js';
import { CreateCommentUseCase } from './create-comment.usecase.js';
import { ModerationRequestService } from '../../services/index.js';

const DATA: CommentData = {
  post_id: 'post-1' as PostId,
  parent_id: null,
  author_id: 'author-1' as AuthorId,
  content: 'Für den Imperator!',
};

describe('CreateCommentUseCase', () => {
  let comments: InMemoryCommentRepository;
  let posts: InMemoryPostRepository;
  let outbox: InMemoryOutbox;
  let useCase: CreateCommentUseCase;

  beforeEach(async () => {
    const ctx = createTestContext();
    comments = new InMemoryCommentRepository();
    posts = new InMemoryPostRepository();
    outbox = new InMemoryOutbox();
    useCase = new CreateCommentUseCase(
      new CommentFactory(createTestContext()),
      comments,
      posts,
      new ModerationRequestService(ctx),
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );

    await posts.save(postAnemic('post-1', { status: PostStatus.PUBLISHED }));
    await posts.save(postAnemic('post-2', { status: PostStatus.PUBLISHED }));
  });

  it('creates a pending comment and requests moderation', async () => {
    const result = await useCase.execute(DATA);

    expect(result.isSuccess).toBe(true);
    expect(result.value.status).toBe(CommentStatus.PENDING);
    expect(comments.items.size).toBe(1);
    expect(
      outbox.events.map((e) => `${e.event_namespace}.${e.event_name}`),
    ).toEqual(['blog.comment.create', 'moderation.requested']);
    expect(outbox.events[1].payload).toMatchObject({
      subject_type: 'blog.comment',
      subject_id: result.value.id,
      content: 'Für den Imperator!',
    });
  });

  it('requests no moderation when the comment is rejected', async () => {
    await useCase.execute({ ...DATA, content: '   ' });

    expect(outbox.events).toHaveLength(0);
  });

  it('creates a reply to an approved comment', async () => {
    await comments.save(
      commentAnemic('parent', { status: CommentStatus.APPROVED }),
    );

    const result = await useCase.execute({
      ...DATA,
      parent_id: 'parent' as CommentId,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.parent_id).toBe('parent');
  });

  it.each([
    ['a draft', { status: PostStatus.DRAFT }],
    ['an archived post', { status: PostStatus.ARCHIVED }],
    ['a deleted post', { status: PostStatus.PUBLISHED, deleted_at: TEST_NOW }],
  ])('refuses comments on %s', async (_, overrides) => {
    await posts.save(postAnemic('post-1', overrides));

    const result = await useCase.execute(DATA);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
    expect(comments.items.size).toBe(0);
  });

  it.each([
    ['a pending parent', { status: CommentStatus.PENDING }],
    ['a spam parent', { status: CommentStatus.SPAM }],
    [
      'a parent on another post',
      { status: CommentStatus.APPROVED, post_id: 'post-2' as PostId },
    ],
    [
      'a deleted parent',
      { status: CommentStatus.APPROVED, deleted_at: TEST_NOW },
    ],
  ])('refuses a reply to %s', async (_, overrides) => {
    await comments.save(commentAnemic('parent', overrides));

    const result = await useCase.execute({
      ...DATA,
      parent_id: 'parent' as CommentId,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
    expect(comments.items.size).toBe(1);
  });

  it('fails on empty content', async () => {
    const result = await useCase.execute({ ...DATA, content: '   ' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
