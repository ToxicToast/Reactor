import type { Optional } from '@toxictoast/shared-types';
import type {
  PollSnapshot,
  StatsRange,
  StoredPoll,
} from '../interfaces/index.js';

export interface PollRepository {
  save(channelId: string, poll: PollSnapshot): Promise<void>;
  list(
    channelId: string,
    range: StatsRange,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<StoredPoll>>;
}
