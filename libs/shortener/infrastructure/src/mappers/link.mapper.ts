import type { Mapper } from '@toxictoast/shared-persistence';
import type { LinkAnemic, LinkId } from '@toxictoast/shortener-domain';
import type { LinkRow } from '../interfaces/index.js';

export class LinkMapper implements Mapper<LinkAnemic, LinkRow> {
  toAnemic(row: LinkRow): LinkAnemic {
    return {
      id: row.id as LinkId,
      target_url: row.target_url,
      description: row.description,
      active: row.active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: LinkAnemic): LinkRow {
    return {
      id: anemic.id,
      target_url: anemic.target_url,
      description: anemic.description,
      active: anemic.active,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
