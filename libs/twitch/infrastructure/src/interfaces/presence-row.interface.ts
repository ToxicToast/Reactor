import type { PresenceEntry } from '@toxictoast/twitch-domain';

export interface PresenceRow extends PresenceEntry {
  channel_id: string;
}
