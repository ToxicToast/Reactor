import type { MediaAnemic } from '@toxictoast/blog-domain';
import type { Media } from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import { MEDIA_STATUS_TO_GRPC } from '../mappings/index.js';

export class MediaGrpcMapper {
  toProto(anemic: MediaAnemic): Media {
    return {
      id: anemic.id,
      object_key: anemic.object_key,
      filename: anemic.filename,
      mime_type: anemic.mime_type,
      size: anemic.size,
      alt_text: anemic.alt_text ?? undefined,
      status: MEDIA_STATUS_TO_GRPC[anemic.status],
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
      deleted_at: toIso(anemic.deleted_at),
    };
  }
}
