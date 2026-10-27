import type { TwitchBotMetrics } from '../interfaces/index.js';

export const NOOP_TWITCH_BOT_METRICS: TwitchBotMetrics = {
  eventReceived: () => undefined,
  eventPublishFailed: () => undefined,
  subscriptionFailed: () => undefined,
  subscriptionRevoked: () => undefined,
  tokenRefreshed: () => undefined,
};
