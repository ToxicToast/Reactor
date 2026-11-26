import type {
  PostRef,
  PostSnapshot,
  PostSnapshotRepository,
} from '@toxictoast/publisher-domain';
import type { TransactionContext } from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type { DataSource } from 'typeorm';
import { TypeOrmSnapshotRepository } from '../abstracts/index.js';
import type { PostSnapshotRow } from '../interfaces/index.js';
import { PostSnapshotMapper } from '../mappers/index.js';
import { PostSnapshotSchema } from '../schemas/index.js';

export class TypeOrmPostSnapshotRepository
  extends TypeOrmSnapshotRepository<PostSnapshotRow>
  implements PostSnapshotRepository
{
  private readonly mapper = new PostSnapshotMapper();

  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, PostSnapshotSchema);
  }

  async latest(post: PostRef): Promise<Nullable<PostSnapshot>> {
    const row = await this.latestRow(post);
    return row ? this.mapper.toSnapshot(row) : null;
  }

  record(snapshot: PostSnapshot): Promise<void> {
    return this.insertRow(this.mapper.toRow(snapshot));
  }
}
