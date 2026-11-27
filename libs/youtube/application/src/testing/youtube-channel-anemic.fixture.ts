import type {
  YouTubeChannelAnemic,
  YouTubeChannelId,
} from '@toxictoast/youtube-domain';
import { YOUTUBE_SCOPES } from '../constants/index.js';

export const YOUTUBE_ID = 'UCabcdefghijklmnopqrstuv';

export const youtubeChannelAnemic = (
  id: string,
  overrides: Partial<YouTubeChannelAnemic> = {},
): YouTubeChannelAnemic => {
  return {
    id: id as YouTubeChannelId,
    youtube_id: YOUTUBE_ID,
    handle: '@ToxicToastTTV',
    title: 'ToxicToast',
    scopes: [...YOUTUBE_SCOPES].sort(),
    connected: true,
    created_at: new Date('2026-11-27T10:00:00Z'),
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
