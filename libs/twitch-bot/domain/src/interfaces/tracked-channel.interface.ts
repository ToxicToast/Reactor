import type { TrackedChannelId } from '../types/index.js';
import type { TwitchIdentity } from './twitch-identity.interface.js';

/** gemeinsame Sicht auf eigene Channels und Freunde für Clips, VODs und Streams */
export interface TrackedChannel extends TwitchIdentity {
  readonly id: TrackedChannelId;
}
