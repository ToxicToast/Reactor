import type { PostRef } from '@toxictoast/publisher-domain';
import {
  insertOnce,
  TypeOrmTableRepository,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type { SnapshotRowBase } from '../interfaces/index.js';

/** gemeinsame Ablage für Post- und Konto-Stände */
export abstract class TypeOrmSnapshotRepository<
  TRow extends SnapshotRowBase,
> extends TypeOrmTableRepository<TRow> {
  protected latestRow(ref: PostRef): Promise<Nullable<TRow>> {
    return this.repository()
      .createQueryBuilder('s')
      .where('s.platform = :platform', { platform: ref.platform })
      .andWhere('s.remote_id = :remoteId', { remoteId: ref.remote_id })
      .orderBy('s.observed_at', 'DESC')
      .getOne();
  }

  /** ein Replay desselben Standes legt keine zweite Zeile an */
  protected async insertRow(row: TRow): Promise<void> {
    await insertOnce(this.repository(), row);
  }
}
