import type { Nullable } from '@toxictoast/shared-types';
import type { PresenceEntry } from '../interfaces/index.js';

export interface PresenceRepository {
  join(channelId: string, userId: string, at: Date): Promise<void>;
  /** entfernt die Anwesenheit und gibt zurück, seit wann der Zuschauer da war */
  leave(channelId: string, userId: string): Promise<Nullable<Date>>;
  count(channelId: string): Promise<number>;
  /** gibt alle offenen Anwesenheiten zurück und setzt ihren Startpunkt auf `at` */
  restartAll(channelId: string, at: Date): Promise<Array<PresenceEntry>>;
}
