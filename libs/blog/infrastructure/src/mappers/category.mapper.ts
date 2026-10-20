import type { CategoryAnemic, CategoryId } from '@toxictoast/blog-domain';
import type { Mapper } from '@toxictoast/shared-persistence';
import type { CategoryRow } from '../interfaces/index.js';

export class CategoryMapper implements Mapper<CategoryAnemic, CategoryRow> {
  toAnemic(row: CategoryRow): CategoryAnemic {
    return {
      id: row.id as CategoryId,
      title: row.title,
      slug: row.slug,
      description: row.description,
      parent_id: row.parent_id as CategoryAnemic['parent_id'],
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: CategoryAnemic): CategoryRow {
    return {
      id: anemic.id,
      title: anemic.title,
      slug: anemic.slug,
      description: anemic.description,
      parent_id: anemic.parent_id,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
