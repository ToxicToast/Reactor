import type { Link } from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import type { LinkAnemic } from '@toxictoast/shortener-domain';

export class LinkGrpcMapper {
  toProto(anemic: LinkAnemic): Link {
    return {
      id: anemic.id,
      target_url: anemic.target_url,
      description: anemic.description ?? undefined,
      active: anemic.active,
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
      deleted_at: toIso(anemic.deleted_at),
    };
  }
}
