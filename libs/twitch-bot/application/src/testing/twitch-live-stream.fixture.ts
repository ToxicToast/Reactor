import type { TwitchLiveStream } from '../interfaces/index.js';

export const twitchLiveStream = (
  twitchId: string,
  overrides: Partial<TwitchLiveStream> = {},
): TwitchLiveStream => {
  return {
    twitch_id: twitchId,
    stream_id: `stream-${twitchId}`,
    type: 'live',
    title: 'Hordentlich verpeilt',
    game_id: '18122',
    game_name: 'World of Warcraft',
    viewer_count: 7,
    started_at: new Date('2026-10-26T19:00:00Z'),
    ...overrides,
  };
};
