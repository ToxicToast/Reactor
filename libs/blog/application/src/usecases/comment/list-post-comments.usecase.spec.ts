import {
  CommentStatus,
  PostStatus,
  type PostId,
} from '@toxictoast/blog-domain';
import {
  commentAnemic,
  InMemoryCommentRepository,
  InMemoryPostRepository,
  postAnemic,
  TEST_NOW,
} from '../../testing/index.js';
import { ListPostCommentsUseCase } from './list-post-comments.usecase.js';

const POST = 'post-1' as PostId;

describe('ListPostCommentsUseCase', () => {
  let comments: InMemoryCommentRepository;
  let posts: InMemoryPostRepository;
  let useCase: ListPostCommentsUseCase;

  beforeEach(async () => {
    comments = new InMemoryCommentRepository();
    posts = new InMemoryPostRepository();
    useCase = new ListPostCommentsUseCase(comments, posts);

    await comments.save(
      commentAnemic('c-1', { status: CommentStatus.APPROVED }),
    );
    await comments.save(commentAnemic('c-2'));
    await comments.save(commentAnemic('c-3', { status: CommentStatus.SPAM }));
    await comments.save(
      commentAnemic('c-4', {
        status: CommentStatus.APPROVED,
        deleted_at: TEST_NOW,
      }),
    );
    await comments.save(
      commentAnemic('c-5', {
        status: CommentStatus.APPROVED,
        post_id: 'post-2' as PostId,
      }),
    );
  });

  it('returns only approved comments of the post', async () => {
    await posts.save(postAnemic('post-1', { status: PostStatus.PUBLISHED }));

    const result = await useCase.execute({ post_id: POST });

    expect(result.isSuccess).toBe(true);
    expect(result.value.map((comment) => comment.id)).toEqual(['c-1']);
  });

  it.each([
    ['a draft', { status: PostStatus.DRAFT }],
    ['an archived post', { status: PostStatus.ARCHIVED }],
  ])('hides comments of %s', async (_, overrides) => {
    await posts.save(postAnemic('post-1', overrides));

    const result = await useCase.execute({ post_id: POST });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('fails when the post does not exist', async () => {
    const result = await useCase.execute({ post_id: POST });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
