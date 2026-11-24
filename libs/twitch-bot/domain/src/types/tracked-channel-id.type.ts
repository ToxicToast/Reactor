import type { TwitchChannelId } from './twitch-channel-id.type.js';
import type { TwitchFriendId } from './twitch-friend-id.type.js';

/** ID eines Channels, den der Bot beobachtet: eigener Channel oder Freund */
export type TrackedChannelId = TwitchChannelId | TwitchFriendId;
