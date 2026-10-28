import { OutboxSchema } from '@toxictoast/shared-persistence';
import { webhookSchemas } from '@toxictoast/shared-webhooks-infrastructure';
import { TwitchChannelDaySchema } from './twitch-channel-day.schema.js';
import { TwitchChatterDaySchema } from './twitch-chatter-day.schema.js';
import { TwitchEventSchema } from './twitch-event.schema.js';
import { TwitchKnownChannelSchema } from './twitch-known-channel.schema.js';
import { TwitchPollSchema } from './twitch-poll.schema.js';
import { TwitchPresenceSchema } from './twitch-presence.schema.js';
import { TwitchRewardDaySchema } from './twitch-reward-day.schema.js';
import { TwitchRewardSchema } from './twitch-reward.schema.js';
import { TwitchSessionChatterSchema } from './twitch-session-chatter.schema.js';
import { TwitchStreamSessionSchema } from './twitch-stream-session.schema.js';
import { TwitchViewerDaySchema } from './twitch-viewer-day.schema.js';
import { TwitchViewerSchema } from './twitch-viewer.schema.js';

export const twitchSchemas = [
  TwitchStreamSessionSchema,
  TwitchChannelDaySchema,
  TwitchViewerSchema,
  TwitchViewerDaySchema,
  TwitchChatterDaySchema,
  TwitchSessionChatterSchema,
  TwitchPresenceSchema,
  TwitchRewardSchema,
  TwitchRewardDaySchema,
  TwitchPollSchema,
  TwitchKnownChannelSchema,
  TwitchEventSchema,
  OutboxSchema,
  ...webhookSchemas,
];
