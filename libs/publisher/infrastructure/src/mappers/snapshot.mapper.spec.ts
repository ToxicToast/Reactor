import type { PostSnapshot } from '@toxictoast/publisher-domain';
import { AccountSnapshotMapper } from './account-snapshot.mapper.js';
import { PostSnapshotMapper } from './post-snapshot.mapper.js';

const OBSERVED_AT = new Date('2026-11-25T12:00:00Z');

describe('Snapshot mappers', () => {
  it('flattens a post snapshot into one row and back', () => {
    const mapper = new PostSnapshotMapper();
    const snapshot: PostSnapshot = {
      post: { platform: 'youtube', remote_id: 'video-1' },
      observed_at: OBSERVED_AT,
      metrics: {
        views: 100,
        likes: 5,
        comments: 1,
        shares: null,
        saves: null,
        reach: null,
        watch_time_ms: 123456,
        avg_view_percentage: 61.5,
        followers_gained: 2,
      },
    };

    const row = mapper.toRow(snapshot);

    expect(row).toMatchObject({
      platform: 'youtube',
      remote_id: 'video-1',
      views: 100,
      shares: null,
    });
    expect(mapper.toSnapshot(row)).toEqual(snapshot);
  });

  it('keeps the account reference apart from the metrics', () => {
    const mapper = new AccountSnapshotMapper();

    expect(
      mapper.toSnapshot({
        platform: 'instagram',
        remote_id: 'account-1',
        observed_at: OBSERVED_AT,
        followers: 120,
        media_count: null,
      }),
    ).toEqual({
      account: { platform: 'instagram', remote_id: 'account-1' },
      observed_at: OBSERVED_AT,
      metrics: { followers: 120, media_count: null },
    });
  });
});
