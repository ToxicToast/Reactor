import type { HelixChatChatter, HelixClip } from '@twurple/api';
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
      created_at: new Date('2026-10-26T19:30:00Z'),
    });
  });

  it('maps a missing vod to null', () => {
    expect(clipFromHelix(clip('')).vod_id).toBeNull();
  });
});
