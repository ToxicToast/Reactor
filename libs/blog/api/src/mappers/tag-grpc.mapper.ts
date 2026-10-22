import type { TagAnemic } from '@toxictoast/blog-domain';
import type { Tag } from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';

export class TagGrpcMapper {
  toProto(anemic: TagAnemic): Tag {
    return {
      id: anemic.id,
      title: anemic.title,
      slug: anemic.slug,
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
      deleted_at: toIso(anemic.deleted_at),
    };
  }
}
