import { OutboxSchema } from '@toxictoast/shared-persistence';
import { TwitchChannelSchema } from './twitch-channel.schema.js';
import { TwitchChatterSchema } from './twitch-chatter.schema.js';
import { TwitchPublishedClipSchema } from './twitch-published-clip.schema.js';
import { TwitchTokenSchema } from './twitch-token.schema.js';

export const twitchBotSchemas = [
  TwitchChannelSchema,
  TwitchTokenSchema,
  TwitchChatterSchema,
  TwitchPublishedClipSchema,
  OutboxSchema,
];
