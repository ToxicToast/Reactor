import type {
  DuePost,
  Platform,
  PostCheck,
  PostCheckRepository,
  PostRef,
} from '@toxictoast/publisher-domain';
import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';
import type { DataSource } from 'typeorm';
import { REF_COLUMNS } from '../constants/index.js';
import type { DuePostRow, PostCheckRow } from '../interfaces/index.js';
import { PostCheckMapper } from '../mappers/index.js';
import { PostCheckSchema, PostSchema } from '../schemas/index.js';

export class TypeOrmPostCheckRepository
  extends TypeOrmTableRepository<PostCheckRow>
  implements PostCheckRepository
{
  private readonly mapper = new PostCheckMapper();

  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, PostCheckSchema);
  }

  async find(post: PostRef): Promise<Nullable<PostCheck>> {
    const row = await this.repository().findOneBy({
      platform: post.platform,
      remote_id: post.remote_id,
    });
    return row ? this.mapper.toCheck(row) : null;
  }

  async save(check: PostCheck): Promise<void> {
    await this.repository().upsert(this.mapper.toRow(check), [...REF_COLUMNS]);
  }

  async candidates(maxFailures: number): Promise<Array<DuePost>> {
    const rows = await this.repositoryOf(PostSchema)
      .createQueryBuilder('p')
      .leftJoin(
        PostCheckSchema.options.name,
        'c',
        'c.platform = p.platform AND c.remote_id = p.remote_id',
      )
      .select('p.platform', 'platform')
      .addSelect('p.remote_id', 'remote_id')
      .addSelect('p.published_at', 'published_at')
      .addSelect('c.checked_at', 'checked_at')
      .where('COALESCE(c.failures, 0) < :maxFailures', { maxFailures })
      .orderBy('c.checked_at', 'ASC', 'NULLS FIRST')
      .getRawMany<DuePostRow>();
    return rows.map((row) => {
      return {
        post: { platform: row.platform as Platform, remote_id: row.remote_id },
        published_at: row.published_at,
        checked_at: row.checked_at,
      };
    });
  }
}
