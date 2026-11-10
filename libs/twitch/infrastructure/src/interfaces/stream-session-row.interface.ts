import type { AnemicRow } from '@toxictoast/shared-persistence';
import type { StreamSessionAnemic } from '@toxictoast/twitch-domain';

export interface StreamSessionRow
  extends AnemicRow, Omit<StreamSessionAnemic, keyof AnemicRow> {}
