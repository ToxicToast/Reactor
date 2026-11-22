import type { MediaId, PublicMediaRepository } from '@toxictoast/blog-domain';
import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { DataSource } from 'typeorm';
import type { PublicMediaRow } from '../interfaces/index.js';
import { PublicMediaSchema } from '../schemas/index.js';

export class TypeOrmPublicMediaRepository
  extends TypeOrmTableRepository<PublicMediaRow>
  implements PublicMediaRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, PublicMediaSchema);
  }

  async findAll(): Promise<Array<MediaId>> {
    const rows = await this.repository().find();
    return rows.map((row) => row.media_id as MediaId);
  }

  async add(id: MediaId, at: Date): Promise<void> {
    await this.repository().upsert({ media_id: id, published_at: at }, [
      'media_id',
    ]);
  }

  async remove(id: MediaId): Promise<void> {
    await this.repository().delete({ media_id: id });
  }
}
