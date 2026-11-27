import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import {
  createTestContext,
  FakeYouTubeAnalyticsSource,
  FakeYouTubeChannelSource,
  FakeYouTubeVideoSource,
  InMemoryYouTubeChannelRepository,
  YOUTUBE_ID,
  youtubeChannelAnemic,
  youtubeVideo,
} from '../testing/index.js';
import { SyncYouTubeAccountUseCase } from './sync-youtube-account.usecase.js';
import { SyncYouTubePostMetricsUseCase } from './sync-youtube-post-metrics.usecase.js';
import { SyncYouTubePostsUseCase } from './sync-youtube-posts.usecase.js';

describe('YouTube sync', () => {
  let channels: InMemoryYouTubeChannelRepository;
  let videos: FakeYouTubeVideoSource;
  let analytics: FakeYouTubeAnalyticsSource;
  let outbox: InMemoryOutbox;
  let account: SyncYouTubeAccountUseCase;
  let posts: SyncYouTubePostsUseCase;
  let metrics: SyncYouTubePostMetricsUseCase;

  beforeEach(async () => {
    const ctx = createTestContext();
    const uow = new ImmediateUnitOfWork();
    channels = new InMemoryYouTubeChannelRepository();
    videos = new FakeYouTubeVideoSource();
    analytics = new FakeYouTubeAnalyticsSource();
    outbox = new InMemoryOutbox();
    account = new SyncYouTubeAccountUseCase(
      channels,
      new FakeYouTubeChannelSource(),
      outbox,
      uow,
      ctx,
    );
    posts = new SyncYouTubePostsUseCase(
      channels,
      videos,
      analytics,
      outbox,
      uow,
      ctx,
    );
    metrics = new SyncYouTubePostMetricsUseCase(
      channels,
      videos,
      analytics,
      outbox,
      uow,
      ctx,
    );
    await channels.save(youtubeChannelAnemic('channel-1'));
  });

  it('reports the account with subscribers and video count', async () => {
    const result = await account.execute();

    expect(result.value).toEqual({ observed: 1 });
    expect(outbox.events[0]).toMatchObject({
      event_namespace: 'social.account',
      event_name: 'observed',
      payload: {
        platform: 'youtube',
        remote_id: YOUTUBE_ID,
        handle: '@ToxicToastTTV',
        url: 'https://www.youtube.com/@ToxicToastTTV',
        followers: 120,
        media_count: 40,
      },
    });
  });

  it('imports every upload and fills analytics where they exist', async () => {
    videos.uploads.push(youtubeVideo('video-1'), youtubeVideo('video-2'));
    analytics.values.set('video-1', {
      avg_watch_time_ms: 9500,
      total_watch_time_ms: 780000,
      avg_view_percentage: 61.5,
      shares: 3,
      followers_gained: 2,
    });

    const result = await posts.execute();

    expect(result.value).toEqual({ observed: 2 });
    expect(outbox.events.map((event) => event.payload)).toMatchObject([
      {
        remote_id: 'video-1',
        account_remote_id: YOUTUBE_ID,
        url: 'https://www.youtube.com/watch?v=video-1',
        metrics: { views: 100, shares: 3, avg_view_percentage: 61.5 },
      },
      {
        remote_id: 'video-2',
        metrics: { views: 100, shares: null, avg_view_percentage: null },
      },
    ]);
  });

  it('marks videos that are gone as failed checks', async () => {
    videos.uploads.push(youtubeVideo('video-1'));

    const result = await metrics.execute({ remote_ids: ['video-1', 'gone'] });

    expect(result.value).toEqual({ observed: 1, failed: 1 });
    expect(videos.requested).toEqual([['video-1', 'gone']]);
    expect(
      outbox.events.map((event) => [event.event_name, event.aggregate_id]),
    ).toEqual([
      ['observed', 'youtube:video-1'],
      ['check_failed', 'youtube:gone'],
    ]);
  });

  it('does nothing without a connected channel', async () => {
    channels.items.clear();

    const result = await metrics.execute({ remote_ids: ['video-1'] });

    expect(result.value).toEqual({ observed: 0, failed: 0 });
    expect(outbox.events).toEqual([]);
  });
});
