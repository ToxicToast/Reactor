import { OutboxSchema } from '@toxictoast/shared-persistence';
import { TwitchChannelSchema } from './twitch-channel.schema.js';
import { TwitchChatterSchema } from './twitch-chatter.schema.js';
import { TwitchFollowerSchema } from './twitch-follower.schema.js';
import { TwitchFriendSchema } from './twitch-friend.schema.js';
import { TwitchLiveStreamSchema } from './twitch-live-stream.schema.js';
import { TwitchMediaImportSchema } from './twitch-media-import.schema.js';
import { TwitchPublishedClipSchema } from './twitch-published-clip.schema.js';
import { TwitchPublishedVideoSchema } from './twitch-published-video.schema.js';
import { TwitchTokenSchema } from './twitch-token.schema.js';

export const twitchBotSchemas = [
  TwitchChannelSchema,
  TwitchTokenSchema,
  TwitchChatterSchema,
  TwitchFollowerSchema,
  TwitchFriendSchema,
  TwitchLiveStreamSchema,
  TwitchPublishedClipSchema,
  TwitchPublishedVideoSchema,
  TwitchMediaImportSchema,
  OutboxSchema,
];
