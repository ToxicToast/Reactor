import type { Nullable } from '@toxictoast/shared-types';
import type { LiveChannel } from '@toxictoast/twitch-application';

export type EncodedLiveChannel = Omit<LiveChannel, 'started_at'> & {
  readonly started_at: Nullable<string>;
};
