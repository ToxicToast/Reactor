import type { DuePost as DuePostProto } from '@toxictoast/contracts-grpc';
import type { DuePost } from '@toxictoast/publisher-domain';
import { toIso } from '@toxictoast/shared-grpc';

export class DuePostGrpcMapper {
  toProto(due: DuePost): DuePostProto {
    return {
      platform: due.post.platform,
      remote_id: due.post.remote_id,
      published_at: due.published_at.toISOString(),
      checked_at: toIso(due.checked_at),
    };
  }
}
