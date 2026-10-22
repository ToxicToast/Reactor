import { CommentStatus, type CommentId } from '@toxictoast/blog-domain';
import {
  commentAnemic,
  InMemoryCommentRepository,
  TEST_NOW,
} from '../../testing/index.js';
import { GetCommentUseCase } from './get-comment.usecase.js';

const ID = 'c-1' as CommentId;

describe('GetCommentUseCase', () => {
  let comments: InMemoryCommentRepository;
  let useCase: GetCommentUseCase;

  beforeEach(() => {
    comments = new InMemoryCommentRepository();
    useCase = new GetCommentUseCase(comments);
  });

  it('returns a comment in any status', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBe(ID);
  });

  it('hides a deleted comment by default', async () => {
    await comments.save(commentAnemic('c-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns a deleted comment with withDeleted', async () => {
    await comments.save(commentAnemic('c-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID, withDeleted: true });

    expect(result.isSuccess).toBe(true);
  });

  it('hides an unapproved comment with approvedOnly', async () => {
    await comments.save(commentAnemic('c-1'));

    const result = await useCase.execute({ id: ID, approvedOnly: true });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns an approved comment with approvedOnly', async () => {
    await comments.save(
      commentAnemic('c-1', { status: CommentStatus.APPROVED }),
    );

    const result = await useCase.execute({ id: ID, approvedOnly: true });

    expect(result.isSuccess).toBe(true);
  });
});
