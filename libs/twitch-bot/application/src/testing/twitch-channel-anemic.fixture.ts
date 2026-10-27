import type {
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import { TWITCH_BOT_SCOPES } from '../constants/index.js';

export const twitchChannelAnemic = (
  id: string,
  overrides: Partial<TwitchChannelAnemic> = {},
): TwitchChannelAnemic => {
  return {
    id: id as TwitchChannelId,
    twitch_id: '123456',
    login: 'toxictoast',
    display_name: 'ToxicToast',
    scopes: [...TWITCH_BOT_SCOPES],
    connected: true,
    created_at: new Date('2026-10-26T19:00:00Z'),
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
