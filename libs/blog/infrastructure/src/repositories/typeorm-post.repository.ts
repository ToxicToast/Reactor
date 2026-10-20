import type {
  CategoryId,
  PostAnemic,
  PostId,
  PostRepository,
  PostStatus,
  TagId,
} from '@toxictoast/blog-domain';
import type { Nullable, Optional } from '@toxictoast/shared-kernel';
import type { TransactionContext } from '@toxictoast/shared-persistence';
import type { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import type { PostRecord, PostRow } from '../interfaces/index.js';
import { PostMapper } from '../mappers/index.js';
import {
  PostCategorySchema,
  PostSchema,
  PostTagSchema,
} from '../schemas/index.js';

export class TypeOrmPostRepository implements PostRepository {
  private readonly mapper = new PostMapper();

  constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
  ) {}

  async save(anemic: PostAnemic): Promise<PostAnemic> {
    const record = this.mapper.toRow(anemic);
    const current = this.context.current();
    if (current) {
      await this.write(current, record);
    } else {
      await this.dataSource.transaction((manager) => {
        return this.write(manager, record);
      });
    }
    return anemic;
  }

  findById(id: PostId, withDeleted = false): Promise<Nullable<PostAnemic>> {
    return this.one(this.query(withDeleted).andWhere('e.id = :id', { id }));
  }

  findList(
    limit?: Optional<number>,
    offset?: Optional<number>,
    withDeleted = false,
  ): Promise<Array<PostAnemic>> {
    return this.many(this.page(this.query(withDeleted), limit, offset));
  }

  findBySlug(slug: string, withDeleted = false): Promise<Nullable<PostAnemic>> {
    return this.one(
      this.query(withDeleted).andWhere('e.slug = :slug', { slug }),
    );
  }

  findByStatus(
    status: PostStatus,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<PostAnemic>> {
    const query = this.query().andWhere('e.status = :status', { status });
    return this.many(this.page(query, limit, offset));
  }

  findByCategoryId(
    categoryId: CategoryId,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<PostAnemic>> {
    const query = this.query().andWhere(
      'EXISTS (SELECT 1 FROM post_categories pc WHERE pc.post_id = e.id AND pc.category_id = :categoryId)',
      { categoryId },
    );
    return this.many(this.page(query, limit, offset));
  }

  findByTagId(
    tagId: TagId,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<PostAnemic>> {
    const query = this.query().andWhere(
      'EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = e.id AND pt.tag_id = :tagId)',
      { tagId },
    );
    return this.many(this.page(query, limit, offset));
  }

  private async write(
    manager: EntityManager,
    record: PostRecord,
  ): Promise<void> {
    const post_id = record.post.id;
    await manager.getRepository(PostSchema).save(record.post);

    await manager.getRepository(PostCategorySchema).delete({ post_id });
    if (record.categories.length > 0) {
      await manager.getRepository(PostCategorySchema).insert(record.categories);
    }

    await manager.getRepository(PostTagSchema).delete({ post_id });
    if (record.tags.length > 0) {
      await manager.getRepository(PostTagSchema).insert(record.tags);
    }
  }

  private query(withDeleted = false): SelectQueryBuilder<PostRow> {
    const query = this.context
      .manager(this.dataSource)
      .getRepository(PostSchema)
      .createQueryBuilder('e');
    if (!withDeleted) {
      query.andWhere('e.deleted_at IS NULL');
    }
    return query;
  }

  private page(
    query: SelectQueryBuilder<PostRow>,
    limit: Optional<number>,
    offset: Optional<number>,
  ): SelectQueryBuilder<PostRow> {
    return query.orderBy('e.created_at', 'DESC').take(limit).skip(offset);
  }

  private async one(
    query: SelectQueryBuilder<PostRow>,
  ): Promise<Nullable<PostAnemic>> {
    const [post] = await this.many(query);
    return post ?? null;
  }

  private async many(
    query: SelectQueryBuilder<PostRow>,
  ): Promise<Array<PostAnemic>> {
    const posts = await query.getMany();
    if (posts.length === 0) {
      return [];
    }

    const ids = posts.map((post) => post.id);
    const manager = this.context.manager(this.dataSource);
    const categories = await manager
      .getRepository(PostCategorySchema)
      .createQueryBuilder('pc')
      .where('pc.post_id IN (:...ids)', { ids })
      .orderBy('pc.position', 'ASC')
      .getMany();
    const tags = await manager
      .getRepository(PostTagSchema)
      .createQueryBuilder('pt')
      .where('pt.post_id IN (:...ids)', { ids })
      .orderBy('pt.position', 'ASC')
      .getMany();

    return posts.map((post) => {
      return this.mapper.toAnemic({
        post,
        categories: categories.filter((row) => row.post_id === post.id),
        tags: tags.filter((row) => row.post_id === post.id),
      });
    });
  }
}
