import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import { TwitchVideoTypes } from '../constants/index.js';
import {
  createTestContext,
  FakeTwitchClipSource,
  FakeTwitchVideoSource,
  InMemoryMediaImportLog,
  InMemoryPublishedLedger,
  InMemoryTwitchChannelRepository,
  twitchChannelAnemic,
  twitchClip,
  twitchVideo,
} from '../testing/index.js';
import { ImportMediaUseCase } from './import-media.usecase.js';
import { RefreshArchiveUseCase } from './refresh-archive.usecase.js';
import { SyncClipsUseCase } from './sync-clips.usecase.js';
import { SyncMediaUseCase } from './sync-media.usecase.js';
import { SyncVideosUseCase } from './sync-videos.usecase.js';

const CHANNEL_ID = 'channel-1' as TwitchChannelId;

describe('Media sync', () => {
  let channels: InMemoryTwitchChannelRepository;
  let clips: FakeTwitchClipSource;
  let videos: FakeTwitchVideoSource;
  let clipLedger: InMemoryPublishedLedger;
  let videoLedger: InMemoryPublishedLedger;
  let imports: InMemoryMediaImportLog;
  let outbox: InMemoryOutbox;
  let syncMedia: SyncMediaUseCase;
  let refreshArchive: RefreshArchiveUseCase;

  const keys = (): Array<string> => {
    return outbox.events.map((e) => `${e.event_namespace}:${e.event_name}`);
  };

  beforeEach(async () => {
    const ctx = createTestContext();
    const uow = new ImmediateUnitOfWork();
    channels = new InMemoryTwitchChannelRepository();
    clips = new FakeTwitchClipSource();
    videos = new FakeTwitchVideoSource();
    clipLedger = new InMemoryPublishedLedger();
    videoLedger = new InMemoryPublishedLedger();
    imports = new InMemoryMediaImportLog();
    outbox = new InMemoryOutbox();
    syncMedia = new SyncMediaUseCase(
      new ImportMediaUseCase(
        channels,
        clips,
        videos,
        clipLedger,
        videoLedger,
        imports,
        outbox,
        uow,
        ctx,
      ),
      new SyncClipsUseCase(channels, clips, clipLedger, outbox, uow, ctx),
      new SyncVideosUseCase(channels, videos, videoLedger, outbox, uow, ctx),
    );
    refreshArchive = new RefreshArchiveUseCase(
      videos,
      videoLedger,
      outbox,
      uow,
      ctx,
    );
    await channels.save(twitchChannelAnemic(CHANNEL_ID));
  });

  it('imports everything once as found, without announcing it again', async () => {
    clips.clips = [
      twitchClip('old', { created_at: new Date('2019-06-01T12:00:00Z') }),
      twitchClip('new', { created_at: new Date('2026-10-26T19:30:00Z') }),
    ];
    videos.videos = [twitchVideo('v1')];

    const first = await syncMedia.execute();
    const second = await syncMedia.execute();

    expect(first.value).toEqual({
      imported_clips: 2,
      imported_videos: 1,
      created_clips: 0,
      created_videos: 0,
    });
    expect(second.value).toEqual({
      imported_clips: 0,
      imported_videos: 0,
      created_clips: 0,
      created_videos: 0,
    });
    expect(keys()).toEqual([
      'twitch.clip:found',
      'twitch.clip:found',
      'twitch.video:found',
    ]);
    expect(outbox.events[0].payload).toMatchObject({ clip_id: 'old' });
  });

  it('announces new clips and videos after the import', async () => {
    await syncMedia.execute();
    clips.clips = [twitchClip('c1')];
    videos.videos = [twitchVideo('v1')];

    const result = await syncMedia.execute();

    expect(result.value).toMatchObject({ created_clips: 1, created_videos: 1 });
    expect(keys()).toEqual(['twitch.clip:created', 'twitch.video:published']);
  });

  it('refreshes the latest archive after the stream ended', async () => {
    videos.videos = [
      twitchVideo('h1'),
      twitchVideo('a1', {
        type: TwitchVideoTypes.ARCHIVE,
        stream_id: 'stream-1',
        duration_seconds: 7200,
      }),
    ];

    const result = await refreshArchive.execute({
      channel: twitchChannelAnemic(CHANNEL_ID),
    });

    expect(result.value).toBe(true);
    expect(keys()).toEqual(['twitch.video:updated']);
    expect(outbox.events[0].payload).toMatchObject({
      video_id: 'a1',
      duration_seconds: 7200,
    });
  });
});
