import type { ClickCount } from './click-count.interface.js';
import type { DailyClicks } from './daily-clicks.interface.js';

export interface LinkClickStats {
  readonly total: number;
  readonly days: ReadonlyArray<DailyClicks>;
  readonly referrers: ReadonlyArray<ClickCount>;
  readonly devices: ReadonlyArray<ClickCount>;
  readonly browsers: ReadonlyArray<ClickCount>;
  readonly countries: ReadonlyArray<ClickCount>;
}
