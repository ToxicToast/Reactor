import type { TagAnemic, TagId } from '@toxictoast/blog-domain';
import type { Mapper } from '@toxictoast/shared-persistence';
import type { TagRow } from '../interfaces/index.js';

export class TagMapper implements Mapper<TagAnemic, TagRow> {
  toAnemic(row: TagRow): TagAnemic {
    return {
      id: row.id as TagId,
      title: row.title,
      slug: row.slug,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: TagAnemic): TagRow {
    return {
      id: anemic.id,
      title: anemic.title,
      slug: anemic.slug,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
