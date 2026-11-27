import type {
  RecordPostFailureUseCase,
  RecordPostUseCase,
} from '@toxictoast/publisher-application';
import { Result } from '@toxictoast/shared-kernel';
import { SocialPostHandler } from './social-post.handler.js';

const OCCURRED_AT = '2026-11-25T12:00:00.000Z';

const metrics = {
  views: 100,
  likes: 5,
  comments: 1,
  shares: null,
  saves: null,
  reach: null,
  avg_watch_time_ms: 9500,
  total_watch_time_ms: 123456,
  avg_view_percentage: 61.5,
  followers_gained: 2,
};

describe('SocialPostHandler', () => {
  let recordPost: jest.Mock;
  let recordFailure: jest.Mock;
  let handler: SocialPostHandler;

  beforeEach(() => {
    recordPost = jest
      .fn()
      .mockResolvedValue(Result.ok({ snapshot_recorded: true }));
    recordFailure = jest.fn().mockResolvedValue(Result.ok({}));
    handler = new SocialPostHandler(
      { execute: recordPost } as unknown as RecordPostUseCase,
      { execute: recordFailure } as unknown as RecordPostFailureUseCase,
    );
  });

  it('records an observed post as imported with its metrics', async () => {
    await handler.handleObserved({
      occurred_at: OCCURRED_AT,
      payload: {
        platform: 'youtube',
        remote_id: 'video-1',
        account_remote_id: 'channel-1',
        url: 'https://www.youtube.com/shorts/video-1',
        title: 'Der Flamer war vielleicht eine dumme Idee',
        published_at: '2026-11-24T18:00:00.000Z',
        duration_seconds: 42.5,
        metrics,
      },
    });

    expect(recordPost).toHaveBeenCalledWith({
      post: {
        platform: 'youtube',
        remote_id: 'video-1',
        account_remote_id: 'channel-1',
        url: 'https://www.youtube.com/shorts/video-1',
        title: 'Der Flamer war vielleicht eine dumme Idee',
        published_at: new Date('2026-11-24T18:00:00.000Z'),
        duration_seconds: 42.5,
        origin: 'imported',
      },
      metrics,
      observed_at: new Date(OCCURRED_AT),
    });
  });

  it('ignores unknown platforms', async () => {
    await handler.handleObserved({
      occurred_at: OCCURRED_AT,
      payload: { platform: 'myspace', remote_id: 'x' },
    });

    expect(recordPost).not.toHaveBeenCalled();
  });

  it('records a failed check', async () => {
    await handler.handleCheckFailed({
      occurred_at: OCCURRED_AT,
      payload: { platform: 'tiktok', remote_id: 'clip-1', error: 'quota' },
    });

    expect(recordFailure).toHaveBeenCalledWith({
      post: { platform: 'tiktok', remote_id: 'clip-1' },
      failed_at: new Date(OCCURRED_AT),
      error: 'quota',
    });
  });
});
