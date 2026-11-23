import type {
  TwitchFriendAnemic,
  TwitchFriendId,
} from '@toxictoast/twitch-bot-domain';

export const twitchFriendAnemic = (
  id: string,
  overrides: Partial<TwitchFriendAnemic> = {},
): TwitchFriendAnemic => {
  return {
    id: id as TwitchFriendId,
    twitch_id: '987654',
    login: 'maybeitsvero',
    display_name: 'Maybeitsvero',
    created_at: new Date('2026-11-23T19:00:00Z'),
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
