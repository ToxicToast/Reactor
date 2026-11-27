import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';
import { socialPostCheckFailed } from './social-post-check-failed.function.js';

describe('social events', () => {
  it('addresses a post by platform and remote id', () => {
    const now = new Date('2026-11-27T12:00:00Z');
    const event = socialPostCheckFailed(
      createFixedTestContext('event-1', () => now),
      { platform: 'youtube', remote_id: 'video-1', error: 'quota' },
    );

    expect(event).toMatchObject({
      event_namespace: 'social.post',
      event_name: 'check_failed',
      aggregate_id: 'youtube:video-1',
      occurred_at: now,
      payload: { platform: 'youtube', remote_id: 'video-1', error: 'quota' },
    });
  });
});
