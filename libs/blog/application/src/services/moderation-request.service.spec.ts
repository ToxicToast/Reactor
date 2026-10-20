import { CommentStatus } from '@toxictoast/blog-domain';
import {
  commentAnemic,
  createTestContext,
  TEST_NOW,
} from '../testing/index.js';
import { ModerationRequestService } from './moderation-request.service.js';

describe('ModerationRequestService', () => {
  it('builds a moderation request for a comment', () => {
    const service = new ModerationRequestService(createTestContext());
    const comment = commentAnemic('c-1', { status: CommentStatus.PENDING });

    const event = service.forComment(comment);

    expect(event).toEqual({
      event_id: 'id-1',
      event_namespace: 'moderation',
      event_name: 'requested',
      event_version: 1,
      aggregate_id: 'c-1',
      occurred_at: TEST_NOW,
      payload: {
        subject_type: 'blog.comment',
        subject_id: 'c-1',
        author_id: comment.author_id,
        content: comment.content,
      },
    });
  });
});
