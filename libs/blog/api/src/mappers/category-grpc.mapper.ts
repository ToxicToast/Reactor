import type { CategoryAnemic } from '@toxictoast/blog-domain';
import type { Category } from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';

export class CategoryGrpcMapper {
  toProto(anemic: CategoryAnemic): Category {
    return {
      id: anemic.id,
      title: anemic.title,
      slug: anemic.slug,
      description: anemic.description ?? undefined,
      parent_id: anemic.parent_id ?? undefined,
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
      deleted_at: toIso(anemic.deleted_at),
    };
  }
}
