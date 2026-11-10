import { eventKey } from './event-key.function.js';

describe('eventKey', () => {
  it('joins namespace and event name', () => {
    expect(eventKey('blog.comment.moderation', 'decided')).toBe(
      'blog.comment.moderation.decided',
    );
  });
});
