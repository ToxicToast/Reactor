import type { Nullable } from '@toxictoast/shared-types';
import type { ChannelRef, KnownChannel } from '../interfaces/index.js';

export interface ChannelDirectoryRepository {
  remember(channel: ChannelRef, seenAt: Date): Promise<void>;
  find(channelId: string): Promise<Nullable<KnownChannel>>;
  list(): Promise<Array<KnownChannel>>;
}
