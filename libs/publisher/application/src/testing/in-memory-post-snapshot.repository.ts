import type { Nullable } from '@toxictoast/shared-types';
import type {
  PostRef,
  PostSnapshot,
  PostSnapshotRepository,
} from '@toxictoast/publisher-domain';
import { InMemorySnapshotLog } from './in-memory-snapshot-log.js';

export class InMemoryPostSnapshotRepository
  extends InMemorySnapshotLog<PostSnapshot>
  implements PostSnapshotRepository
{
  constructor() {
    super((snapshot) => snapshot.post);
  }

  async latest(post: PostRef): Promise<Nullable<PostSnapshot>> {
    return this.latestFor(post);
  }

  async record(snapshot: PostSnapshot): Promise<void> {
    this.append(snapshot);
  }
}
