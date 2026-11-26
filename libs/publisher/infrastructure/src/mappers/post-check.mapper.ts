import type { PostCheck } from '@toxictoast/publisher-domain';
import type { PostCheckRow } from '../interfaces/index.js';

export class PostCheckMapper {
  toCheck(row: PostCheckRow): PostCheck {
    return {
      post: { platform: row.platform, remote_id: row.remote_id },
      checked_at: row.checked_at,
      failures: row.failures,
      last_error: row.last_error,
    };
  }

  toRow(check: PostCheck): PostCheckRow {
    return {
      ...check.post,
      checked_at: check.checked_at,
      failures: check.failures,
      last_error: check.last_error,
    };
  }
}
