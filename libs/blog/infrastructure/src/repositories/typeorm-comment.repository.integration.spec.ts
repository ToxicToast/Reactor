import { randomUUID } from 'node:crypto';
import {
  CommentModerator,
  CommentStatus,
  type AuthorId,
  type CommentAnemic,
  type CommentId,
  type PostId,
} from '@toxictoast/blog-domain';
import { BlogTestDatabase } from '../testing/index.js';
import { TypeOrmCommentRepository } from './typeorm-comment.repository.js';

const POST = randomUUID() as PostId;

const comment = (overrides: Partial<CommentAnemic> = {}): CommentAnemic => {
  return {
    id: randomUUID() as CommentId,
    post_id: POST,
    parent_id: null,
    author_id: randomUUID() as AuthorId,
    content: 'Für den Imperator!',
    status: CommentStatus.PENDING,
    moderation_note: null,
    moderated_by: null,
    moderated_at: null,
    created_at: new Date('2026-10-20T10:00:00Z'),
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

const at = (hour: number): Date => {
  return new Date(`2026-10-20T${String(hour).padStart(2, '0')}:00:00Z`);
};

describe('TypeOrmCommentRepository', () => {
  const database = new BlogTestDatabase();
  let comments: TypeOrmCommentRepository;

  beforeAll(async () => {
    await database.start();
    comments = new TypeOrmCommentRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('saves and loads a moderated reply', async () => {
    const parent = comment({ status: CommentStatus.APPROVED });
    const reply = comment({
      parent_id: parent.id,
      status: CommentStatus.SPAM,
      moderation_note: 'link farm',
      moderated_by: CommentModerator.AI,
      moderated_at: at(11),
    });
    await comments.save(parent);
    await comments.save(reply);

    expect(await comments.findById(reply.id)).toEqual(reply);
  });

  it('finds the comments of a post oldest first', async () => {
    const later = comment({
      status: CommentStatus.APPROVED,
      created_at: at(12),
    });
    const earlier = comment({
      status: CommentStatus.APPROVED,
      created_at: at(9),
    });
    const pending = comment({ created_at: at(10) });
    await comments.save(later);
    await comments.save(earlier);
    await comments.save(pending);
    await comments.save(comment({ post_id: randomUUID() as PostId }));
    await comments.save(
      comment({ status: CommentStatus.APPROVED, deleted_at: at(13) }),
    );

    expect(await comments.findByPostId(POST)).toEqual([
      earlier,
      pending,
      later,
    ]);
    expect(await comments.findByPostId(POST, CommentStatus.APPROVED)).toEqual([
      earlier,
      later,
    ]);
  });

  it('pages the moderation queue oldest first', async () => {
    const first = comment({ created_at: at(8) });
    const second = comment({ created_at: at(9) });
    const third = comment({ created_at: at(10) });
    await comments.save(third);
    await comments.save(first);
    await comments.save(second);

    expect(await comments.findByStatus(CommentStatus.PENDING, 2, 1)).toEqual([
      second,
      third,
    ]);
  });
});
