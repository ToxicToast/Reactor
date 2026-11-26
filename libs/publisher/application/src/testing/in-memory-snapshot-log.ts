import type { Nullable } from '@toxictoast/shared-types';
import type { PostRef } from '@toxictoast/publisher-domain';
import { refKey } from './ref-key.function.js';

/** gemeinsame Ablage für Post- und Konto-Stände */
export class InMemorySnapshotLog<
  TSnapshot extends { readonly observed_at: Date },
> {
  readonly items: Array<TSnapshot> = [];

  constructor(private readonly refOf: (snapshot: TSnapshot) => PostRef) {}

  protected latestFor(ref: PostRef): Nullable<TSnapshot> {
    const key = refKey(ref);
    const matching = this.items
      .filter((snapshot) => refKey(this.refOf(snapshot)) === key)
      .sort((a, b) => a.observed_at.getTime() - b.observed_at.getTime());
    return matching.at(-1) ?? null;
  }

  protected append(snapshot: TSnapshot): void {
    this.items.push(snapshot);
  }
}
