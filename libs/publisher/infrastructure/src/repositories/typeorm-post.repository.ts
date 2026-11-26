import type {
  Post,
  PostFilter,
  PostRef,
  PostRepository,
} from '@toxictoast/publisher-domain';
import {
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { DataSource } from 'typeorm';
import { POST_UPDATABLE_COLUMNS, REF_COLUMNS } from '../constants/index.js';
import { PostSchema } from '../schemas/index.js';

export class TypeOrmPostRepository
  extends TypeOrmTableRepository<Post>
  implements PostRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, PostSchema);
  }

  async save(post: Post): Promise<void> {
    await this.repository()
      .createQueryBuilder()
      .insert()
      .into(PostSchema)
      .values(post)
      .orUpdate([...POST_UPDATABLE_COLUMNS], [...REF_COLUMNS])
      .execute();
  }

  find(ref: PostRef): Promise<Nullable<Post>> {
    return this.repository().findOneBy({
      platform: ref.platform,
      remote_id: ref.remote_id,
    });
  }

  list(
    filter: PostFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Post>> {
    const query = this.repository().createQueryBuilder('p');
    if (filter.platform !== null) {
      query.andWhere('p.platform = :platform', { platform: filter.platform });
    }
    if (filter.account_remote_id !== null) {
      query.andWhere('p.account_remote_id = :account', {
        account: filter.account_remote_id,
      });
    }
    return query
      .orderBy('p.published_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
