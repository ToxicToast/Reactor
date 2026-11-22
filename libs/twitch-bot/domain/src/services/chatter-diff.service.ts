import { diffByUserId } from '../functions/index.js';
import type { Chatter, ChatterDiff } from '../interfaces/index.js';

export class ChatterDiffService {
  diff(
    previous: ReadonlyArray<Chatter>,
    current: ReadonlyArray<Chatter>,
  ): ChatterDiff {
    const { added, removed } = diffByUserId(previous, current);
    return { joined: added, left: removed };
  }
}
