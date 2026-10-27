import type { Chatter } from './chatter.interface.js';

export interface ChatterDiff {
  readonly joined: Array<Chatter>;
  readonly left: Array<Chatter>;
}
