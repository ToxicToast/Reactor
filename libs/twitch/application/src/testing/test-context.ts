import { createCountingTestContext } from '@toxictoast/shared-application';
import type { DomainContext } from '@toxictoast/shared-kernel';
import type { ChannelRef } from '@toxictoast/twitch-domain';
import type { TwitchStatsConfig } from '../interfaces/index.js';

export const TWITCH_TEST_NOW = new Date('2026-10-28T20:00:00Z');

export const TWITCH_TEST_CONFIG: TwitchStatsConfig = { time_zone: 'UTC' };

export const TWITCH_TEST_CHANNEL: ChannelRef = {
  channel_id: '123456',
  channel_login: 'toxictoast',
  channel_name: 'ToxicToast',
};

export const createTwitchTestContext = (
  now: Date = TWITCH_TEST_NOW,
): DomainContext => {
  return createCountingTestContext(now);
};
