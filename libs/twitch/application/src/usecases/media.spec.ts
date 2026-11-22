import {
  VideoTypes,
  type Clip,
  type StreamSessionId,
  type Video,
} from '@toxictoast/twitch-domain';
import { MediaChangeKinds } from '../constants/index.js';
import {
  TWITCH_TEST_CHANNEL,
  TWITCH_TEST_NOW,
  TwitchTestHarness,
} from '../testing/index.js';
import { ListClipsUseCase } from './list-clips.usecase.js';
import { ListVideosUseCase } from './list-videos.usecase.js';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;

const clip = (id: string, overrides: Partial<Clip> = {}): Clip => ({
  clip_id: id,
  channel_id: CHANNEL_ID,
  url: `https://clips.twitch.tv/${id}`,
  title: `Clip ${id}`,
  creator_id: '777',
  creator_name: 'Clipper',
  duration_seconds: 29.9,
  thumbnail_url: `https://clips-media.twitch.tv/${id}.jpg`,
  vod_id: null,
  vod_offset: null,
  created_at: TWITCH_TEST_NOW,
  ...overrides,
});

const video = (id: string, overrides: Partial<Video> = {}): Video => ({
  video_id: id,
  channel_id: CHANNEL_ID,
  stream_id: null,
  type: VideoTypes.HIGHLIGHT,
  title: `Video ${id}`,
  description: '',
  url: `https://www.twitch.tv/videos/${id}`,
  thumbnail_url: `https://static-cdn.jtvnw.net/${id}.jpg`,
  duration_seconds: 600,
  language: 'de',
  created_at: TWITCH_TEST_NOW,
  published_at: TWITCH_TEST_NOW,
  ...overrides,
});

describe('Media', () => {
  let harness: TwitchTestHarness;
  let sequence: number;

  const record = (
    topic: string,
    name: string,
    media: Parameters<TwitchTestHarness['record']['execute']>[0]['media'],
  ) => {
    sequence++;
    return harness.record.execute({
      event: {
        event_id: `media-${sequence}`,
        topic,
        name,
        channel_id: CHANNEL_ID,
        occurred_at: TWITCH_TEST_NOW,
        payload: {},
      },
      observation: null,
      media,
    });
  };

  beforeEach(() => {
    harness = new TwitchTestHarness();
    sequence = 0;
  });

  it('stores clips and filters them by vod', async () => {
    await record('twitch.clip', 'found', {
      kind: MediaChangeKinds.CLIP,
      clip: clip('a', { vod_id: 'v1', vod_offset: 754 }),
    });
    await record('twitch.clip', 'created', {
      kind: MediaChangeKinds.CLIP,
      clip: clip('b'),
    });

    const all = await new ListClipsUseCase(harness.clips).execute({
      channel_id: CHANNEL_ID,
    });
    const ofVod = await new ListClipsUseCase(harness.clips).execute({
      channel_id: CHANNEL_ID,
      vod_id: 'v1',
    });

    expect(all.value).toHaveLength(2);
    expect(ofVod.value?.map((item) => item.clip_id)).toEqual(['a']);
  });

  it('overwrites an archive with its final length', async () => {
    await record('twitch.video', 'created', {
      kind: MediaChangeKinds.VIDEO,
      video: video('a1', { type: VideoTypes.ARCHIVE, duration_seconds: 120 }),
    });
    await record('twitch.video', 'updated', {
      kind: MediaChangeKinds.VIDEO,
      video: video('a1', { type: VideoTypes.ARCHIVE, duration_seconds: 7200 }),
    });

    expect(harness.videos.items.get('a1')?.duration_seconds).toBe(7200);
  });

  it('filters videos by type', async () => {
    await record('twitch.video', 'found', {
      kind: MediaChangeKinds.VIDEO,
      video: video('a1', { type: VideoTypes.ARCHIVE }),
    });
    await record('twitch.video', 'found', {
      kind: MediaChangeKinds.VIDEO,
      video: video('h1'),
    });

    const highlights = await new ListVideosUseCase(
      harness.videos,
      harness.sessions,
    ).execute({ channel_id: CHANNEL_ID, type: VideoTypes.HIGHLIGHT });

    expect(highlights.value?.map((item) => item.video_id)).toEqual(['h1']);
  });

  it('refuses an unknown session', async () => {
    const result = await new ListVideosUseCase(
      harness.videos,
      harness.sessions,
    ).execute({
      channel_id: CHANNEL_ID,
      session_id: '0192f3a0-0000-7000-8000-000000000999' as StreamSessionId,
    });

    expect(result.isFailure).toBe(true);
  });
});
