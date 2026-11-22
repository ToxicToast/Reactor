import type {
  HelixChannelFollower,
  HelixChatChatter,
  HelixClip,
  HelixVideo,
} from '@twurple/api';
import { videoFromHelix } from './video-from-helix.function.js';
import { followerFromHelix } from './follower-from-helix.function.js';
import { chatterFromHelix } from './chatter-from-helix.function.js';
import { clipFromHelix } from './clip-from-helix.function.js';

describe('chatterFromHelix', () => {
  it('maps a twitch chatter', () => {
    const chatter = {
      userId: '42',
      userName: 'viewer',
      userDisplayName: 'Viewer',
    } as unknown as HelixChatChatter;

    expect(chatterFromHelix(chatter)).toEqual({
      user_id: '42',
      user_login: 'viewer',
      user_name: 'Viewer',
    });
  });
});

describe('clipFromHelix', () => {
  const clip = (videoId: string): HelixClip => {
    return {
      id: 'clip-1',
      url: 'https://clips.twitch.tv/clip-1',
      title: 'Epic',
      creatorId: '7',
      creatorDisplayName: 'Clipper',
      duration: 29.9,
      views: 12,
      thumbnailUrl: 'https://clips-media.twitch.tv/clip-1.jpg',
      videoId,
      vodOffset: 754,
      creationDate: new Date('2026-10-26T19:30:00Z'),
    } as unknown as HelixClip;
  };

  it('maps a twitch clip', () => {
    expect(clipFromHelix(clip('vod-1'))).toEqual({
      clip_id: 'clip-1',
      url: 'https://clips.twitch.tv/clip-1',
      title: 'Epic',
      creator_id: '7',
      creator_name: 'Clipper',
      duration_seconds: 29.9,
      view_count: 12,
      thumbnail_url: 'https://clips-media.twitch.tv/clip-1.jpg',
      vod_id: 'vod-1',
      vod_offset: 754,
      created_at: new Date('2026-10-26T19:30:00Z'),
    });
  });

  it('maps a missing vod to null', () => {
    expect(clipFromHelix(clip('')).vod_id).toBeNull();
  });
});

describe('followerFromHelix', () => {
  it('maps a twitch follower', () => {
    const follower = {
      userId: '42',
      userName: 'viewer',
      userDisplayName: 'Viewer',
      followDate: new Date('2026-11-01T10:00:00Z'),
    } as unknown as HelixChannelFollower;

    expect(followerFromHelix(follower)).toEqual({
      user_id: '42',
      user_login: 'viewer',
      user_name: 'Viewer',
      followed_at: new Date('2026-11-01T10:00:00Z'),
    });
  });
});

describe('videoFromHelix', () => {
  it('maps a twitch video', () => {
    const video = {
      id: 'v1',
      streamId: 'stream-1',
      type: 'archive',
      title: 'Abendstream',
      description: '',
      url: 'https://www.twitch.tv/videos/v1',
      getThumbnailUrl: (width: number, height: number) => {
        return `https://static-cdn.jtvnw.net/v1-${width}x${height}.jpg`;
      },
      durationInSeconds: 7265,
      language: 'de',
      creationDate: new Date('2026-10-26T18:00:00Z'),
      publishDate: new Date('2026-10-26T18:00:00Z'),
    } as unknown as HelixVideo;

    expect(videoFromHelix(video)).toEqual({
      video_id: 'v1',
      stream_id: 'stream-1',
      type: 'archive',
      title: 'Abendstream',
      description: '',
      url: 'https://www.twitch.tv/videos/v1',
      thumbnail_url: 'https://static-cdn.jtvnw.net/v1-1280x720.jpg',
      duration_seconds: 7265,
      language: 'de',
      created_at: new Date('2026-10-26T18:00:00Z'),
      published_at: new Date('2026-10-26T18:00:00Z'),
    });
  });
});
