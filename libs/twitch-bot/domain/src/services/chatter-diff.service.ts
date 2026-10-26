import type { Chatter, ChatterDiff } from '../interfaces/index.js';

export class ChatterDiffService {
  diff(
    previous: ReadonlyArray<Chatter>,
    current: ReadonlyArray<Chatter>,
  ): ChatterDiff {
    const before = this.byUserId(previous);
    const now = this.byUserId(current);

    return {
      joined: [...now.values()].filter(
        (chatter) => !before.has(chatter.user_id),
      ),
      left: [...before.values()].filter((chatter) => !now.has(chatter.user_id)),
    };
  }

  private byUserId(chatters: ReadonlyArray<Chatter>): Map<string, Chatter> {
    const map = new Map<string, Chatter>();
    for (const chatter of chatters) {
      if (!map.has(chatter.user_id)) {
        map.set(chatter.user_id, chatter);
      }
    }
    return map;
  }
}
