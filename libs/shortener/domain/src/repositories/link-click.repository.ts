import type {
  ClickRange,
  LinkClick,
  LinkClickStats,
} from '../interfaces/index.js';
import type { LinkId } from '../types/index.js';

export interface LinkClickRepository {
  /** false, wenn das Event schon gezählt war */
  record(click: LinkClick): Promise<boolean>;
  stats(
    linkId: LinkId,
    range: ClickRange,
    timeZone: string,
    top: number,
  ): Promise<LinkClickStats>;
}
