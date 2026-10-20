import type {
  MediaAnemic,
  MediaId,
  MediaStatus,
} from '@toxictoast/blog-domain';
import type { Mapper } from '@toxictoast/shared-persistence';
import type { MediaRow } from '../interfaces/index.js';

export class MediaMapper implements Mapper<MediaAnemic, MediaRow> {
  toAnemic(row: MediaRow): MediaAnemic {
    return {
      id: row.id as MediaId,
      object_key: row.object_key,
      filename: row.filename,
      mime_type: row.mime_type,
      size: row.size,
      alt_text: row.alt_text,
      status: row.status as MediaStatus,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: MediaAnemic): MediaRow {
    return {
      id: anemic.id,
      object_key: anemic.object_key,
      filename: anemic.filename,
      mime_type: anemic.mime_type,
      size: anemic.size,
      alt_text: anemic.alt_text,
      status: anemic.status,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
