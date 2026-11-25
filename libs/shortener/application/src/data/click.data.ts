import type { Optional } from '@toxictoast/shared-types';
import type { LinkId, RawClick } from '@toxictoast/shortener-domain';

export type RecordClickInput = RawClick;

export interface RecordClickOutput {
  readonly recorded: boolean;
}

export interface GetLinkStatsInput {
  readonly id: LinkId;
  readonly from?: Optional<Date>;
  readonly to?: Optional<Date>;
}
