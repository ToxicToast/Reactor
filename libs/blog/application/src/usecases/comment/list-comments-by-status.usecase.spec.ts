import { CommentStatus } from '@toxictoast/blog-domain';
import {
  commentAnemic,
  InMemoryCommentRepository,
  TEST_NOW,
} from '../../testing/index.js';
import { ListCommentsByStatusUseCase } from './list-comments-by-status.usecase.js';

describe('ListCommentsByStatusUseCase', () => {
  let comments: InMemoryCommentRepository;
  let useCase: ListCommentsByStatusUseCase;

  beforeEach(async () => {
    comments = new InMemoryCommentRepository();
    useCase = new ListCommentsByStatusUseCase(comments);

    await comments.save(commentAnemic('c-1'));
    await comments.save(commentAnemic('c-2'));
    await comments.save(commentAnemic('c-3', { deleted_at: TEST_NOW }));
    await comments.save(
      commentAnemic('c-4', { status: CommentStatus.APPROVED }),
    );
  });

  it('returns the moderation queue', async () => {
    const result = await useCase.execute({ status: CommentStatus.PENDING });

    expect(result.value.map((comment) => comment.id)).toEqual(['c-1', 'c-2']);
  });

  it('applies limit and offset', async () => {
    const result = await useCase.execute({
      status: CommentStatus.PENDING,
      limit: 1,
      offset: 1,
    });

    expect(result.value.map((comment) => comment.id)).toEqual(['c-2']);
  });
});
